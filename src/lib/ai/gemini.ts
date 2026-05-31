import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { graphResponseSchema, geminiGraphResponseSchema, remediationResponseSchema } from "@/lib/ai/schemas";
import type { EdgeType, GraphEdge, GraphNode, GraphSnapshot, NodeLabel } from "@/types/graph";
import type { RemediationPlan } from "@/types/remediation";

type ExtractInput = {
  artifactId: string;
  fileName: string;
  mimeType: string;
  text: string;
  fileBuffer?: Buffer;
  currentGraph: GraphSnapshot;
};

export type BatchArtifactContext = {
  artifactId: string;
  name: string;
  type: string;
  mimeType: string;
  parserMode: string | null;
  rawPayload: string | null;
};

type BatchAnalysisInput = {
  projectName: string;
  currentGraph: GraphSnapshot;
  artifacts: BatchArtifactContext[];
};

const nodeLabels: NodeLabel[] = ["BusinessProcess", "Application", "SoftwareComponent", "DataAsset", "CryptoAsset", "ExternalService"];
const edgeTypes: EdgeType[] = ["DEPENDS_ON", "USES", "PROCESSES", "IMPLEMENTS", "PROTECTED_BY", "CALLS", "HOSTS"];

function getClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required for AI multimodal extraction.");
  }
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

function truncateForPrompt(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}\n[truncated]` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function buildBatchAnalysisPrompt(input: BatchAnalysisInput) {
  const artifacts = input.artifacts.map((artifact) => ({
    artifactId: artifact.artifactId,
    name: artifact.name,
    type: artifact.type,
    mimeType: artifact.mimeType,
    parserMode: artifact.parserMode,
    excerpt: truncateForPrompt(artifact.rawPayload || "(No extracted text was persisted for this artifact.)", 6000)
  }));

  return `Analyze these AETHER-PQC artifacts as one evidence set and return a unified post-quantum cryptography risk graph.
Project: ${input.projectName}

Current graph snapshot:
${JSON.stringify(input.currentGraph)}

Artifact evidence:
${JSON.stringify(artifacts)}

Rules:
- Return only JSON with nodes and edges in the provided schema.
- Infer cross-file relationships, duplicate system references, dependency paths, and shared cryptographic controls.
- Prefer exact ids from the current graph for matching entities; create stable snake_case ids for new entities.
- Preserve sourceArtifactIds and use the artifactId values shown above.
- Do not remove deterministic high-risk findings; add context, edges, or duplicate evidence around them.
- Score RSA, DSA, DH, ECDSA, ECDH as 10.
- Score AES-256, SHA-256, SHA-384, SHA-512, ML-KEM, ML-DSA, SLH-DSA as 0.
- Mark inferred cross-file links with confidence below 0.85 unless explicitly supported by artifact text.`;
}

function cleanAndValidateGraph(rawText: string): GraphSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON. Please try uploading the artifact again.");
  }

  if (!isRecord(parsed)) {
    return { nodes: [], edges: [] };
  }

  const rawNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : [];

  // Normalize nodes
  const nodes = rawNodes.map((n, idx): GraphNode | null => {
    if (!isRecord(n)) return null;

    // Normalize label
    let label: NodeLabel = "SoftwareComponent";
    const rawLabel = String(n.label || "").toLowerCase().replace(/[^a-z]/g, "");
    if (rawLabel.includes("crypto") || rawLabel.includes("cipher") || rawLabel.includes("key")) {
      label = "CryptoAsset";
    } else if (rawLabel.includes("business") || rawLabel.includes("process")) {
      label = "BusinessProcess";
    } else if (rawLabel.includes("app")) {
      label = "Application";
    } else if (rawLabel.includes("component") || rawLabel.includes("software")) {
      label = "SoftwareComponent";
    } else if (rawLabel.includes("data") || rawLabel.includes("asset")) {
      label = "DataAsset";
    } else if (rawLabel.includes("external") || rawLabel.includes("service") || rawLabel.includes("api")) {
      label = "ExternalService";
    } else {
      // Direct enum check
      const matched = nodeLabels.find(l => l.toLowerCase() === rawLabel);
      if (matched) label = matched;
    }

    // Normalize vulnerabilityScore (0 to 10)
    let score = Number(n.vulnerabilityScore);
    if (Number.isNaN(score)) score = 0;
    score = Math.max(0, Math.min(10, score));

    // Normalize confidence (0 to 1)
    let confidence = typeof n.confidence === "number" ? n.confidence : 1;
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      id: String(n.id || `node_${idx}`).trim() || `node_${idx}`,
      label,
      name: String(n.name || n.id || "Unnamed Node").trim(),
      vulnerabilityScore: score,
      confidence,
      sourceArtifactIds: Array.isArray(n.sourceArtifactIds) ? n.sourceArtifactIds.map(String) : [],
      attributes: isRecord(n.attributes) ? n.attributes : {}
    };
  }).filter((node): node is GraphNode => Boolean(node));

  // Normalize edges
  const edges = rawEdges.map((e): GraphEdge | null => {
    if (!isRecord(e)) return null;

    // Normalize type
    let type: EdgeType = "DEPENDS_ON";
    const rawType = String(e.type || "").toUpperCase().replace(/[^A-Z_]/g, "");
    if (rawType.includes("DEPEND")) {
      type = "DEPENDS_ON";
    } else if (rawType.includes("USE")) {
      type = "USES";
    } else if (rawType.includes("PROCESS")) {
      type = "PROCESSES";
    } else if (rawType.includes("IMPLEMENT")) {
      type = "IMPLEMENTS";
    } else if (rawType.includes("PROTECT")) {
      type = "PROTECTED_BY";
    } else if (rawType.includes("CALL")) {
      type = "CALLS";
    } else if (rawType.includes("HOST")) {
      type = "HOSTS";
    } else {
      const matched = edgeTypes.find(t => t === rawType);
      if (matched) type = matched;
    }

    // Normalize confidence (0 to 1)
    let confidence = typeof e.confidence === "number" ? e.confidence : 1;
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      source: String(e.source || "").trim(),
      target: String(e.target || "").trim(),
      type,
      confidence,
      sourceArtifactIds: Array.isArray(e.sourceArtifactIds) ? e.sourceArtifactIds.map(String) : []
    };
  }).filter((edge): edge is GraphEdge => Boolean(edge?.source && edge.target));

  // Validate using Zod schema
  try {
    return graphResponseSchema.parse({ nodes, edges });
  } catch (zodError) {
    console.error("Zod validation failed during healing:", zodError);
    // Filter out invalid items that fail checks
    const validNodes = nodes.filter((n) => {
      try {
        return n.id && nodeLabels.includes(n.label) && typeof n.vulnerabilityScore === "number";
      } catch {
        return false;
      }
    });

    const validNodeIds = new Set(validNodes.map((n) => n.id));
    const validEdges = edges.filter((e) => {
      try {
        return e.source && e.target && validNodeIds.has(e.source) && validNodeIds.has(e.target) && edgeTypes.includes(e.type);
      } catch {
        return false;
      }
    });

    return {
      nodes: validNodes,
      edges: validEdges
    };
  }
}

export async function extractGraphWithGemini(input: ExtractInput): Promise<GraphSnapshot> {
  const ai = getClient();
  const prompt = `Extract a post-quantum cryptography risk graph from this artifact.
Artifact ID: ${input.artifactId}
File name: ${input.fileName}
MIME type: ${input.mimeType}
Current graph: ${JSON.stringify(input.currentGraph)}

Rules:
- Return only nodes and edges in the provided schema.
- Use stable snake_case ids.
- Prefer exact ids from Current graph for matching entities.
- Score RSA, DSA, DH, ECDSA, ECDH as 10.
- Score AES-256, SHA-256, SHA-384, SHA-512, ML-KEM, ML-DSA, SLH-DSA as 0.
- Mark visual/OCR inferences with confidence below 0.85 unless explicit.

Extracted text when available:
${input.text || "(No embedded text; inspect the attached file visually.)"}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }];
  if (input.fileBuffer?.length) {
    parts.push({
      inlineData: {
        mimeType: input.mimeType,
        data: input.fileBuffer.toString("base64")
      }
    });
  }

  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: geminiGraphResponseSchema
    }
  });

  if (!response.text) throw new Error("Gemini returned an empty graph extraction response.");
  return cleanAndValidateGraph(response.text);
}

export async function analyzeBatchWithGemini(input: BatchAnalysisInput): Promise<GraphSnapshot> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: buildBatchAnalysisPrompt(input) }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: geminiGraphResponseSchema
    }
  });

  if (!response.text) throw new Error("Gemini returned an empty batch analysis response.");
  return cleanAndValidateGraph(response.text);
}

export async function generateRemediationsWithGemini(graph: GraphSnapshot): Promise<RemediationPlan[]> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create PQC migration remediations for this graph. Return JSON with a remediations array. Graph: ${JSON.stringify(graph)}`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  if (!response.text) throw new Error("Gemini returned an empty remediation response.");
  return remediationResponseSchema.parse(JSON.parse(response.text)).remediations;
}
