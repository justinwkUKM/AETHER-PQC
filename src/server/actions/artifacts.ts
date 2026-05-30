"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { extractGraphWithGemini } from "@/lib/ai/gemini";
import { calculateRiskScore, mergeGraphSnapshots, parseGraphSnapshot } from "@/lib/graph";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { assertSupportedFile, extractText, inferArtifactType } from "@/lib/parsing/files";
import { parseStructuredJson, parseTextForCrypto } from "@/lib/parsing/deterministic";
import { generateDeterministicRemediations } from "@/lib/remediation/deterministic";
import { storeArtifactObject } from "@/lib/storage";
import { requireProject, requireUser } from "@/server/auth/guards";
import type { GraphSnapshot } from "@/types/graph";

async function logEvent(projectId: string, artifactId: string | null, message: string, level: "INFO" | "WARN" | "ERROR" | "SUCCESS" = "INFO") {
  await prisma.scanEvent.create({ data: { projectId, artifactId, message, level } });
}

async function persistRemediations(projectId: string, graph: GraphSnapshot) {
  const remediations = generateDeterministicRemediations(graph);
  await prisma.remediation.deleteMany({ where: { projectId } });

  if (remediations.length === 0) return;

  await prisma.remediation.createMany({
    data: remediations.map((remediation) => ({
      projectId,
      targetNode: remediation.targetNode,
      threatPath: remediation.threatPath,
      vulnerablePrimitive: remediation.vulnerablePrimitive,
      recommendedMigration: remediation.recommendedMigration,
      priority: remediation.priority,
      actionPlan: remediation.actionPlan,
      confidence: remediation.confidence,
      sourceArtifactIds: remediation.sourceArtifactIds
    }))
  });
}

export async function uploadArtifact(projectId: string, formData: FormData) {
  const user = await requireUser();
  const project = await requireProject(user.id, projectId);
  const file = formData.get("artifact");

  if (!(file instanceof File)) {
    throw new Error("Artifact file is required.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  assertSupportedFile(file.name, mimeType, buffer.length, env.MAX_UPLOAD_BYTES);

  const artifactId = randomUUID();
  const artifactType = inferArtifactType(file.name, mimeType);
  const stored = await storeArtifactObject({
    userId: user.id,
    projectId,
    artifactId,
    fileName: file.name,
    buffer,
    mimeType
  });

  await prisma.artifact.create({
    data: {
      id: artifactId,
      projectId,
      name: file.name,
      type: artifactType,
      mimeType,
      sizeBytes: buffer.length,
      storagePath: stored.storagePath,
      parseStatus: "PROCESSING"
    }
  });

  await logEvent(projectId, artifactId, `Stored artifact ${file.name}.`);

  try {
    const text = await extractText(buffer, mimeType, file.name);
    const deterministic = artifactType === "JSON" ? parseStructuredJson(text, artifactId) : parseTextForCrypto(text, artifactId);
    const shouldUseAi = !deterministic || ["PDF", "IMAGE", "CSV", "MARKDOWN", "TEXT"].includes(artifactType);
    let incomingGraph = deterministic;
    let parserMode: "DETERMINISTIC" | "AI_MULTIMODAL" | "HYBRID" = deterministic ? "DETERMINISTIC" : "AI_MULTIMODAL";

    if (shouldUseAi) {
      await logEvent(projectId, artifactId, "Dispatching artifact to Gemini Developer API multimodal extractor.");
      const aiGraph = await extractGraphWithGemini({
        artifactId,
        fileName: file.name,
        mimeType,
        text,
        fileBuffer: ["PDF", "IMAGE"].includes(artifactType) ? buffer : undefined,
        currentGraph: parseGraphSnapshot(project.graphSnapshot)
      });
      incomingGraph = deterministic ? mergeGraphSnapshots(deterministic, aiGraph) : aiGraph;
      parserMode = deterministic ? "HYBRID" : "AI_MULTIMODAL";
    }

    if (!incomingGraph) {
      throw new Error("No cryptographic or architecture entities could be extracted.");
    }

    const mergedGraph = mergeGraphSnapshots(project.graphSnapshot, incomingGraph);
    const riskScore = calculateRiskScore(mergedGraph);
    await persistRemediations(projectId, mergedGraph);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        graphSnapshot: mergedGraph as Prisma.InputJsonValue,
        riskScore,
        lastScanAt: new Date()
      }
    });

    await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        rawPayload: text.slice(0, 100_000),
        parseStatus: "COMPLETED",
        parserMode,
        aiModel: parserMode === "DETERMINISTIC" ? null : env.GEMINI_MODEL,
        confidence: Math.max(...incomingGraph.nodes.map((node) => node.confidence), 0)
      }
    });
    await logEvent(projectId, artifactId, `Scan completed using ${parserMode}.`, "SUCCESS");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown artifact processing failure.";
    await prisma.artifact.update({
      where: { id: artifactId },
      data: { parseStatus: "FAILED", parseError: message }
    });
    await logEvent(projectId, artifactId, message, "ERROR");
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/scan`);
}
