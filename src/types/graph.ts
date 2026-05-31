import { z } from "zod";

export const nodeLabelSchema = z.enum([
  "BusinessProcess",
  "Application",
  "SoftwareComponent",
  "DataAsset",
  "CryptoAsset",
  "ExternalService"
]);

export const edgeTypeSchema = z.enum([
  "DEPENDS_ON",
  "USES",
  "PROCESSES",
  "IMPLEMENTS",
  "PROTECTED_BY",
  "CALLS",
  "HOSTS"
]);

export const graphNodeSchema = z.object({
  id: z.string().min(1),
  label: nodeLabelSchema,
  name: z.string().min(1),
  vulnerabilityScore: z.number().min(0).max(10),
  exposureScore: z.number().min(0).max(10).default(0),
  exposureLevel: z.enum(["INTERNAL", "PARTNER", "INTERNET_EDGE", "UNKNOWN"]).default("UNKNOWN"),
  effectiveRiskScore: z.number().min(0).max(10).default(0),
  exposureReasons: z.array(z.string()).default([]),
  exposurePath: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).default(1),
  sourceArtifactIds: z.array(z.string()).default([]),
  attributes: z.record(z.string(), z.unknown()).default({})
});

export const graphEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type: edgeTypeSchema,
  confidence: z.number().min(0).max(1).default(1),
  sourceArtifactIds: z.array(z.string()).default([])
});

export const graphSnapshotSchema = z.object({
  nodes: z.array(graphNodeSchema).default([]),
  edges: z.array(graphEdgeSchema).default([])
});

export type NodeLabel = z.infer<typeof nodeLabelSchema>;
export type EdgeType = z.infer<typeof edgeTypeSchema>;
export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;
export type GraphSnapshot = z.infer<typeof graphSnapshotSchema>;
