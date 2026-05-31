import { describe, expect, it } from "vitest";
import { buildPlatformExposureSummary } from "@/lib/platform-exposure";
import type { GraphSnapshot } from "@/types/graph";

const graph: GraphSnapshot = {
  nodes: [
    {
      id: "gateway",
      label: "Application",
      name: "Public API Gateway TLS 1.0 RSA key exchange",
      vulnerabilityScore: 8,
      exposureScore: 9,
      exposureLevel: "INTERNET_EDGE",
      effectiveRiskScore: 8.6,
      exposureReasons: ["Network-edge keyword"],
      exposurePath: ["internet", "gateway"],
      confidence: 0.9,
      sourceArtifactIds: [],
      attributes: {}
    },
    {
      id: "internet",
      label: "ExternalService",
      name: "Public Internet",
      vulnerabilityScore: 0,
      exposureScore: 9,
      exposureLevel: "INTERNET_EDGE",
      effectiveRiskScore: 0,
      exposureReasons: ["External service boundary"],
      confidence: 1,
      sourceArtifactIds: [],
      attributes: {}
    },
    {
      id: "worker",
      label: "SoftwareComponent",
      name: "Internal batch worker",
      vulnerabilityScore: 1,
      exposureScore: 1,
      exposureLevel: "INTERNAL",
      effectiveRiskScore: 1,
      exposureReasons: [],
      confidence: 1,
      sourceArtifactIds: [],
      attributes: {}
    }
  ],
  edges: []
};

describe("platform exposure summary", () => {
  it("groups network-facing weak protocols and external boundaries", () => {
    const summary = buildPlatformExposureSummary(graph);

    expect(summary.findings).toHaveLength(2);
    expect(summary.networkFacingCritical).toBe(1);
    expect(summary.tlsOrProtocolFindings).toBe(1);
    expect(summary.externalBoundaryCount).toBe(2);
    expect(summary.findings[0].category).toBe("TLS / protocol");
    expect(summary.findings[0].protocolHints).toContain("TLS 1.0");
    expect(summary.findings[0].action).toContain("Retire the legacy protocol");
  });
});
