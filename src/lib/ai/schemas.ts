import { graphSnapshotSchema } from "@/types/graph";
import { remediationPlansSchema } from "@/types/remediation";

export const graphResponseSchema = graphSnapshotSchema;
export const remediationResponseSchema = remediationPlansSchema;

export const geminiGraphResponseSchema = {
  type: "object",
  properties: {
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          name: { type: "string" },
          vulnerabilityScore: { type: "number" },
          confidence: { type: "number" },
          sourceArtifactIds: { type: "array", items: { type: "string" } },
          attributes: { type: "object" }
        },
        required: ["id", "label", "name", "vulnerabilityScore", "confidence", "sourceArtifactIds", "attributes"]
      }
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source: { type: "string" },
          target: { type: "string" },
          type: { type: "string" },
          confidence: { type: "number" },
          sourceArtifactIds: { type: "array", items: { type: "string" } }
        },
        required: ["source", "target", "type", "confidence", "sourceArtifactIds"]
      }
    }
  },
  required: ["nodes", "edges"]
} as const;
