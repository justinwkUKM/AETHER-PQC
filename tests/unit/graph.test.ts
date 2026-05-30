import { describe, expect, it } from "vitest";
import { calculateRiskScore, mergeGraphSnapshots, parseGraphSnapshot } from "@/lib/graph";

describe("graph utilities", () => {
  it("falls back to an empty graph for invalid snapshots", () => {
    expect(parseGraphSnapshot({ nope: true })).toEqual({ nodes: [], edges: [] });
  });

  it("deduplicates nodes and edges while preserving highest risk", () => {
    const merged = mergeGraphSnapshots(
      {
        nodes: [
          {
            id: "crypto_rsa",
            label: "CryptoAsset",
            name: "RSA",
            vulnerabilityScore: 7,
            confidence: 0.6,
            sourceArtifactIds: ["a1"],
            attributes: { first: true }
          }
        ],
        edges: []
      },
      {
        nodes: [
          {
            id: "crypto_rsa",
            label: "CryptoAsset",
            name: "RSA-2048",
            vulnerabilityScore: 10,
            confidence: 0.9,
            sourceArtifactIds: ["a2"],
            attributes: { second: true }
          }
        ],
        edges: [
          {
            source: "component_api",
            target: "crypto_rsa",
            type: "IMPLEMENTS",
            confidence: 0.8,
            sourceArtifactIds: ["a2"]
          }
        ]
      }
    );

    expect(merged.nodes).toHaveLength(1);
    expect(merged.nodes[0].vulnerabilityScore).toBe(10);
    expect(merged.nodes[0].sourceArtifactIds).toEqual(["a1", "a2"]);
    expect(merged.edges).toHaveLength(1);
  });

  it("calculates average risk", () => {
    expect(
      calculateRiskScore({
        nodes: [
          { id: "a", label: "CryptoAsset", name: "RSA", vulnerabilityScore: 10, confidence: 1, sourceArtifactIds: [], attributes: {} },
          { id: "b", label: "CryptoAsset", name: "AES", vulnerabilityScore: 2, confidence: 1, sourceArtifactIds: [], attributes: {} }
        ],
        edges: []
      })
    ).toBe(6);
  });
});
