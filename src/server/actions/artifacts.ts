"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import type { Prisma } from "@prisma/client";
import { analyzeBatchWithGemini, extractGraphWithGemini, type BatchArtifactContext } from "@/lib/ai/gemini";
import { enrichGraphExposure } from "@/lib/exposure";
import { calculateRiskScore, mergeGraphSnapshots, parseGraphSnapshot } from "@/lib/graph";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { assertSupportedFile, extractText, inferArtifactType } from "@/lib/parsing/files";
import { parseStructuredJson, parseTextForCrypto } from "@/lib/parsing/deterministic";
import { generateDeterministicRemediations } from "@/lib/remediation/deterministic";
import { storeArtifactObject } from "@/lib/storage";
import { requireProject, requireUser } from "@/server/auth/guards";
import type { GraphSnapshot } from "@/types/graph";

type UploadArtifactResult = {
  artifactId: string;
  status: "COMPLETED" | "FAILED";
  parserMode?: "DETERMINISTIC" | "AI_MULTIMODAL" | "HYBRID";
  error?: string;
};

type BatchAnalysisResult = {
  status: "COMPLETED" | "SKIPPED" | "FAILED";
  artifactCount: number;
  message: string;
};

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

export async function uploadArtifact(projectId: string, formData: FormData): Promise<UploadArtifactResult> {
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

    const mergedGraph = enrichGraphExposure(mergeGraphSnapshots(project.graphSnapshot, incomingGraph));
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
        rawPayload: text ? text.slice(0, 100_000) : JSON.stringify(incomingGraph, null, 2),
        parseStatus: "COMPLETED",
        parserMode,
        aiModel: parserMode === "DETERMINISTIC" ? null : env.GEMINI_MODEL,
        confidence: Math.max(...incomingGraph.nodes.map((node) => node.confidence), 0)
      }
    });
    await logEvent(projectId, artifactId, `Scan completed using ${parserMode}.`, "SUCCESS");

    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/project/${projectId}/scan`);
    return { artifactId, status: "COMPLETED", parserMode };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown artifact processing failure.";
    await prisma.artifact.update({
      where: { id: artifactId },
      data: { parseStatus: "FAILED", parseError: message }
    });
    await logEvent(projectId, artifactId, message, "ERROR");
    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/project/${projectId}/scan`);
    return { artifactId, status: "FAILED", error: message };
  }
}

export async function analyzeProjectBatch(projectId: string, artifactIds: string[] = []): Promise<BatchAnalysisResult> {
  const user = await requireUser();
  const project = await requireProject(user.id, projectId);
  const selectedArtifactIds = Array.from(new Set(artifactIds));

  const artifacts = await prisma.artifact.findMany({
    where: {
      projectId,
      parseStatus: "COMPLETED",
      ...(selectedArtifactIds.length > 0 ? { id: { in: selectedArtifactIds } } : {})
    },
    orderBy: { createdAt: "asc" }
  });

  if (artifacts.length < 2) {
    const message = "Batch analysis skipped because fewer than two completed artifacts were available.";
    await logEvent(projectId, null, message, "WARN");
    return { status: "SKIPPED", artifactCount: artifacts.length, message };
  }

  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === "test") {
    const message = "Batch analysis skipped because GEMINI_API_KEY is not configured for local AI execution.";
    await logEvent(projectId, null, message, "WARN");
    return { status: "SKIPPED", artifactCount: artifacts.length, message };
  }

  await logEvent(projectId, null, `Running unified Gemini batch analysis over ${artifacts.length} completed artifacts.`);

  try {
    const contexts: BatchArtifactContext[] = artifacts.map((artifact) => ({
      artifactId: artifact.id,
      name: artifact.name,
      type: artifact.type,
      mimeType: artifact.mimeType,
      parserMode: artifact.parserMode,
      rawPayload: artifact.rawPayload
    }));
    const currentGraph = parseGraphSnapshot(project.graphSnapshot);
    const batchGraph = await analyzeBatchWithGemini({
      projectName: project.name,
      currentGraph,
      artifacts: contexts
    });
    const mergedGraph = enrichGraphExposure(mergeGraphSnapshots(currentGraph, batchGraph));
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

    const message = `Unified batch analysis completed across ${artifacts.length} artifacts.`;
    await logEvent(projectId, null, message, "SUCCESS");
    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/project/${projectId}/scan`);
    return { status: "COMPLETED", artifactCount: artifacts.length, message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown batch analysis failure.";
    await logEvent(projectId, null, `Batch analysis failed: ${message}`, "ERROR");
    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/project/${projectId}/scan`);
    return { status: "FAILED", artifactCount: artifacts.length, message };
  }

}

export async function deleteArtifact(projectId: string, artifactId: string) {
  return deleteArtifacts(projectId, [artifactId]);
}

export async function deleteArtifacts(projectId: string, artifactIds: string[]) {
  const user = await requireUser();
  const project = await requireProject(user.id, projectId);

  const artifacts = await prisma.artifact.findMany({
    where: { id: { in: artifactIds }, projectId }
  });

  if (artifacts.length === 0) return;

  try {
    const storageDriver = process.env.STORAGE_DRIVER ?? env.STORAGE_DRIVER;
    if (storageDriver !== "gcs") {
      for (const artifact of artifacts) {
        if (artifact.storagePath) {
          await unlink(artifact.storagePath).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.error("Error deleting physical files:", err);
  }

  // Bulk delete database records
  await prisma.artifact.deleteMany({
    where: { id: { in: artifactIds }, projectId }
  });

  // Filter and reconstruct graph, removing entities associated ONLY with these deleted artifacts
  const currentGraph = parseGraphSnapshot(project.graphSnapshot);
  const deletedSet = new Set(artifactIds);

  const updatedNodes = currentGraph.nodes.map(node => {
    const nextSources = node.sourceArtifactIds.filter(id => !deletedSet.has(id));
    return { ...node, sourceArtifactIds: nextSources };
  }).filter(node => node.sourceArtifactIds.length > 0);

  const updatedNodeIds = new Set(updatedNodes.map(n => n.id));

  const updatedEdges = currentGraph.edges.map(edge => {
    const nextSources = edge.sourceArtifactIds.filter(id => !deletedSet.has(id));
    return { ...edge, sourceArtifactIds: nextSources };
  }).filter(edge => edge.sourceArtifactIds.length > 0 && updatedNodeIds.has(edge.source) && updatedNodeIds.has(edge.target));

  const mergedGraph = enrichGraphExposure({ nodes: updatedNodes, edges: updatedEdges });
  const riskScore = calculateRiskScore(mergedGraph);

  // Update remediations dynamically based on the updated graph
  await persistRemediations(projectId, mergedGraph);

  // Update project snapshot & stats
  await prisma.project.update({
    where: { id: projectId },
    data: {
      graphSnapshot: mergedGraph as Prisma.InputJsonValue,
      riskScore,
      lastScanAt: new Date()
    }
  });

  await prisma.scanEvent.create({
    data: {
      projectId,
      message: `Bulk deleted ${artifacts.length} artifacts and removed associated threat entities.`,
      level: "SUCCESS"
    }
  });

  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/scan`);
}
