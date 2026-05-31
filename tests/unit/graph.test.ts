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
            exposureScore: 0,
            exposureLevel: "UNKNOWN",
            effectiveRiskScore: 0,
            exposureReasons: [],
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
            exposureScore: 8,
            exposureLevel: "INTERNET_EDGE",
            effectiveRiskScore: 9.1,
            exposureReasons: ["Network edge"],
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
    expect(merged.nodes[0].exposureScore).toBe(8);
    expect(merged.nodes[0].sourceArtifactIds).toEqual(["a1", "a2"]);
    expect(merged.edges).toHaveLength(1);
  });

  it("calculates exposure-aware blended risk", () => {
    expect(
      calculateRiskScore({
        nodes: [
          { id: "a", label: "CryptoAsset", name: "RSA", vulnerabilityScore: 10, exposureScore: 10, exposureLevel: "INTERNET_EDGE", effectiveRiskScore: 10, exposureReasons: [], confidence: 1, sourceArtifactIds: [], attributes: {} },
          { id: "b", label: "CryptoAsset", name: "AES", vulnerabilityScore: 2, exposureScore: 0, exposureLevel: "UNKNOWN", effectiveRiskScore: 1.1, exposureReasons: [], confidence: 1, sourceArtifactIds: [], attributes: {} }
        ],
        edges: []
      })
    ).toBe(7.1);
  });
});
