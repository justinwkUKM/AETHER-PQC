import { describe, expect, it } from "vitest";
import { generateDeterministicRemediations } from "@/lib/remediation/deterministic";

describe("remediation generation", () => {
  it("creates critical migration plans for vulnerable crypto assets", () => {
    const remediations = generateDeterministicRemediations({
      nodes: [
        {
          id: "crypto_rsa",
          label: "CryptoAsset",
          name: "RSA-2048",
          vulnerabilityScore: 10,
          confidence: 1,
          sourceArtifactIds: ["artifact_1"],
          attributes: {}
        }
      ],
      edges: []
    });

    expect(remediations).toHaveLength(1);
    expect(remediations[0].priority).toBe("CRITICAL");
    expect(remediations[0].recommendedMigration).toContain("ML-KEM");
  });

  it("skips low-risk assets", () => {
    const remediations = generateDeterministicRemediations({
      nodes: [
        {
          id: "crypto_aes",
          label: "CryptoAsset",
          name: "AES-256",
          vulnerabilityScore: 0,
          confidence: 1,
          sourceArtifactIds: ["artifact_1"],
          attributes: {}
        }
      ],
      edges: []
    });

    expect(remediations).toEqual([]);
  });

  it("maps medium and high risk scores to the expected priorities", () => {
    const remediations = generateDeterministicRemediations({
      nodes: [
        {
          id: "crypto_unknown",
          label: "CryptoAsset",
          name: "legacy cipher",
          vulnerabilityScore: 5,
          confidence: 0.8,
          sourceArtifactIds: ["artifact_1"],
          attributes: {}
        },
        {
          id: "crypto_high",
          label: "CryptoAsset",
          name: "partner pki",
          vulnerabilityScore: 8,
          confidence: 0.8,
          sourceArtifactIds: ["artifact_2"],
          attributes: {}
        }
      ],
      edges: []
    });

    expect(remediations.map((item) => item.priority)).toEqual(["MEDIUM", "HIGH"]);
  });
});
