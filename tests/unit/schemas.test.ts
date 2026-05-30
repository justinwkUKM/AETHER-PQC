import { describe, expect, it } from "vitest";
import { graphResponseSchema, remediationResponseSchema } from "@/lib/ai/schemas";

describe("AI response schemas", () => {
  it("validates graph responses", () => {
    const graph = graphResponseSchema.parse({
      nodes: [
        {
          id: "crypto_rsa",
          label: "CryptoAsset",
          name: "RSA",
          vulnerabilityScore: 10,
          confidence: 0.9,
          sourceArtifactIds: ["a1"],
          attributes: {}
        }
      ],
      edges: []
    });

    expect(graph.nodes[0].id).toBe("crypto_rsa");
  });

  it("validates remediation responses", () => {
    const response = remediationResponseSchema.parse({
      remediations: [
        {
          targetNode: "crypto_rsa",
          threatPath: "app -> RSA",
          priority: "CRITICAL",
          actionPlan: [{ title: "Migrate", detail: "Move to PQC-ready primitive." }]
        }
      ]
    });

    expect(response.remediations[0].priority).toBe("CRITICAL");
  });
});
