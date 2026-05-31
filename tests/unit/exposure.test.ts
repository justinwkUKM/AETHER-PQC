import { describe, expect, it } from "vitest";
import { effectiveRiskScore, enrichGraphExposure } from "@/lib/exposure";

describe("exposure analysis", () => {
  it("propagates exposure from external services to connected crypto assets", () => {
    const graph = enrichGraphExposure({
      nodes: [
        {
          id: "external",
          label: "ExternalService",
          name: "Public internet",
          vulnerabilityScore: 0,
          exposureScore: 0,
          exposureLevel: "UNKNOWN",
          effectiveRiskScore: 0,
          exposureReasons: [],
          confidence: 1,
          sourceArtifactIds: ["a1"],
          attributes: {}
        },
        {
          id: "api",
          label: "Application",
          name: "API gateway",
          vulnerabilityScore: 0,
          exposureScore: 0,
          exposureLevel: "UNKNOWN",
          effectiveRiskScore: 0,
          exposureReasons: [],
          confidence: 1,
          sourceArtifactIds: ["a1"],
          attributes: {}
        },
        {
          id: "crypto",
          label: "CryptoAsset",
          name: "RSA-2048",
          vulnerabilityScore: 10,
          exposureScore: 0,
          exposureLevel: "UNKNOWN",
          effectiveRiskScore: 0,
          exposureReasons: [],
          confidence: 1,
          sourceArtifactIds: ["a1"],
          attributes: {}
        }
      ],
      edges: [
        { source: "external", target: "api", type: "CALLS", confidence: 1, sourceArtifactIds: ["a1"] },
        { source: "api", target: "crypto", type: "USES", confidence: 1, sourceArtifactIds: ["a1"] }
      ]
    });

    const crypto = graph.nodes.find((node) => node.id === "crypto");
    expect(crypto?.exposureScore).toBeGreaterThan(5);
    expect(crypto?.effectiveRiskScore).toBeGreaterThan(8);
    expect(crypto?.exposurePath).toEqual(["api", "crypto"]);
  });

  it("combines vulnerability and exposure into effective risk", () => {
    expect(effectiveRiskScore(10, 10)).toBe(10);
    expect(effectiveRiskScore(10, 0)).toBe(5.5);
    expect(effectiveRiskScore(5, 6)).toBe(4.1);
  });
});
