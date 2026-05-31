import { describe, expect, it } from "vitest";
import {
  confidenceLabel,
  describeEvidence,
  evidenceBadge,
  explainEdge,
  explainNode,
  interpretArchitecture,
  scoreExplanation,
  threatPathSummary
} from "@/lib/graph-explanations";
import type { GraphNode, GraphSnapshot } from "@/types/graph";

function node(overrides: Partial<GraphNode>): GraphNode {
  return {
    id: "node",
    label: "CryptoAsset",
    name: "RSA",
    vulnerabilityScore: 10,
    exposureScore: 9,
    exposureLevel: "INTERNET_EDGE",
    effectiveRiskScore: 9.6,
    exposureReasons: ["Network-edge keyword"],
    exposurePath: ["external", "gateway"],
    confidence: 0.9,
    sourceArtifactIds: ["artifact-1"],
    attributes: {},
    ...overrides
  };
}

describe("graph explanation helpers", () => {
  it("labels synthetic network context as inferred rather than real infrastructure", () => {
    const synthetic = node({
      id: "external_network_context",
      label: "ExternalService",
      name: "External network context",
      vulnerabilityScore: 0,
      effectiveRiskScore: 0
    });

    expect(explainNode(synthetic).summary).toContain("generated exposure anchor");
    expect(evidenceBadge(synthetic)).toBe("Inferred context");
  });

  it("summarizes internet-facing crypto findings with architect action", () => {
    const graph: GraphSnapshot = {
      nodes: [
        node({ id: "external", label: "ExternalService", name: "Public Internet" }),
        node({ id: "gateway", label: "Application", name: "Legacy Gateway" }),
        node({ id: "rsa", name: "RSA-2048" })
      ],
      edges: []
    };
    const rsa = graph.nodes[2];

    expect(interpretArchitecture(rsa, graph, []).action).toContain("public or partner-facing system");
    expect(threatPathSummary(rsa, graph, [])).toBe("Public Internet -> Legacy Gateway -> RSA-2048");
  });

  it("describes evidence using artifact names", () => {
    const artifactMap = new Map([
      ["artifact-1", { id: "artifact-1", name: "gateway-tls-notes.md", type: "text/markdown" }]
    ]);

    expect(describeEvidence(node({}), artifactMap)).toContain("gateway-tls-notes.md");
  });

  it("explains score and confidence levels", () => {
    expect(scoreExplanation(node({ effectiveRiskScore: 9.4 }))).toContain("critical");
    expect(confidenceLabel(0.9)).toBe("High confidence");
    expect(confidenceLabel(0.5)).toBe("Needs review");
  });

  it("explains directed edge semantics", () => {
    expect(explainEdge("PROTECTED_BY", "outbound")).toContain("this item");
    expect(explainEdge("USES", "inbound")).toContain("the other item");
  });
});
