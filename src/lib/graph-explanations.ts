import type { GraphEdge, GraphNode, GraphSnapshot } from "@/types/graph";

export type ArtifactEvidence = {
  id: string;
  name: string;
  type: string;
};

export type GraphConnection = {
  direction: "inbound" | "outbound";
  edge: GraphEdge;
  node: GraphNode;
};

export function explainNode(node: GraphNode) {
  if (isSyntheticNetworkContext(node)) {
    return {
      summary: "This is a generated exposure anchor, not a real application component.",
      why: "AETHER adds it when uploaded evidence mentions public, internet, gateway, TLS, port, or inbound network context. It lets the graph show which crypto findings are near the network edge."
    };
  }

  if (node.label === "CryptoAsset") {
    return {
      summary: `${node.name} is a cryptographic finding extracted from the uploaded evidence.`,
      why: `Its priority is based on cryptographic weakness (${node.vulnerabilityScore.toFixed(1)}), exposure (${node.exposureScore.toFixed(1)}), and confidence (${(node.confidence * 100).toFixed(0)}%).`
    };
  }

  if (node.label === "ExternalService") {
    return {
      summary: "This item represents a boundary, third-party, public endpoint, or external dependency.",
      why: "External services raise exposure for connected systems because they can indicate inbound or cross-boundary reachability."
    };
  }

  return {
    summary: `This item represents a ${node.label.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} found in the uploaded evidence.`,
    why: "It helps connect crypto assets to business, application, data, and service context so remediation work has ownership and impact."
  };
}

export function interpretArchitecture(
  node: GraphNode,
  graph: GraphSnapshot,
  connections: GraphConnection[]
) {
  const connectedCrypto = connections.filter((connection) => connection.node.label === "CryptoAsset").length;
  const connectedExternal = connections.filter((connection) => connection.node.label === "ExternalService").length;
  const path = readableExposurePath(node, graph);
  const exposure = node.exposureLevel === "INTERNET_EDGE"
    ? "This item appears close to an internet or inbound boundary, so weaknesses here should be reviewed before internal-only findings."
    : node.exposureLevel === "PARTNER"
      ? "This item appears connected to a partner or third-party boundary, so ownership and contractual remediation may matter."
      : node.exposureScore >= 5
        ? "This item inherits moderate exposure through connected systems or protocol hints."
        : "No strong network-edge signal was extracted yet; validate whether this is truly internal before downgrading priority.";

  if (node.label === "CryptoAsset") {
    return {
      summary: `${node.name} should be interpreted as a crypto or protocol risk in architectural context, not only as a standalone primitive.`,
      exposure,
      action: node.exposureScore >= 7
        ? "Trace the edge path to confirm the public or partner-facing system that uses this primitive, then prioritize migration with that owner."
        : "Confirm where this primitive is used and whether any upstream gateway, API, or data flow increases exposure."
    };
  }

  if (isSyntheticNetworkContext(node)) {
    return {
      summary: "This node is an analysis aid that anchors public or network-edge language found in the uploaded evidence.",
      exposure,
      action: "Use its connected items to identify which real systems or crypto findings may be near an external boundary."
    };
  }

  return {
    summary: `${node.name} has ${connections.length} extracted relationship${connections.length === 1 ? "" : "s"}${connectedCrypto ? `, including ${connectedCrypto} crypto finding${connectedCrypto === 1 ? "" : "s"}` : ""}${connectedExternal ? ` and ${connectedExternal} external boundary signal${connectedExternal === 1 ? "" : "s"}` : ""}.`,
    exposure: path.length > 1 ? `${exposure} Extracted path: ${path.join(" -> ")}.` : exposure,
    action: "Validate whether the connected items reflect the real architecture, then use confirmed relationships to assign remediation ownership."
  };
}

export function describeEvidence(node: GraphNode, artifactMap: Map<string, ArtifactEvidence>) {
  const artifactNames = node.sourceArtifactIds
    .map((id) => artifactMap.get(id)?.name)
    .filter((name): name is string => Boolean(name));

  if (artifactNames.length > 0) {
    return `Supported by ${artifactNames.slice(0, 3).join(", ")}${artifactNames.length > 3 ? ` and ${artifactNames.length - 3} more artifact${artifactNames.length - 3 === 1 ? "" : "s"}` : ""}.`;
  }

  if (node.sourceArtifactIds.length > 0) {
    return `Supported by ${node.sourceArtifactIds.length} artifact reference${node.sourceArtifactIds.length === 1 ? "" : "s"}, but the display name is unavailable.`;
  }

  return "No source artifact is attached to this node yet, so treat it as context that needs review.";
}

export function scoreExplanation(node: GraphNode) {
  const effective = node.effectiveRiskScore || node.vulnerabilityScore;
  if (effective >= 8.5) {
    return "Effective risk is critical because crypto weakness and exposure combine into an urgent remediation signal.";
  }
  if (node.exposureScore >= 7 && node.vulnerabilityScore >= 4) {
    return "Exposure raises the priority because this weakness appears close to a reachable boundary.";
  }
  if (node.vulnerabilityScore >= 8 && node.exposureScore < 4) {
    return "The primitive is weak, but current evidence suggests lower exposure; validate internal-only assumptions before deferring.";
  }
  if (node.vulnerabilityScore <= 1 && node.exposureScore >= 7) {
    return "This item is exposed, but the detected crypto weakness is low; monitor its connected dependencies.";
  }
  return "Risk is calculated from cryptographic weakness, exposure, and extracted confidence.";
}

export function confidenceLabel(confidence: number) {
  if (confidence >= 0.85) return "High confidence";
  if (confidence >= 0.6) return "Review useful";
  return "Needs review";
}

export function explainEdge(type: GraphEdge["type"], direction: "inbound" | "outbound") {
  const relation = direction === "outbound" ? "this item" : "the other item";
  switch (type) {
    case "PROTECTED_BY":
      return `${relation} is described as protected by the connected crypto or control.`;
    case "USES":
      return `${relation} uses the connected item in the extracted evidence.`;
    case "DEPENDS_ON":
      return `${relation} depends on the connected item.`;
    case "CALLS":
      return `${relation} calls the connected service or component.`;
    case "PROCESSES":
      return `${relation} processes the connected data or workflow.`;
    case "IMPLEMENTS":
      return `${relation} implements the connected capability or primitive.`;
    case "HOSTS":
      return `${relation} hosts the connected item.`;
    default:
      return "This relationship was extracted from uploaded evidence.";
  }
}

export function evidenceBadge(node: GraphNode) {
  if (isSyntheticNetworkContext(node)) return "Inferred context";
  if (node.confidence < 0.6) return "Needs review";
  if (node.sourceArtifactIds.length > 0) return "Evidence-backed";
  return "Unlinked evidence";
}

export function threatPathSummary(node: GraphNode, graph: GraphSnapshot, connections: GraphConnection[]) {
  const path = readableExposurePath(node, graph);
  if (path.length > 1) {
    return `${path.join(" -> ")}${node.label === "CryptoAsset" ? ` -> ${node.name}` : ""}`;
  }

  const externalConnection = connections.find((connection) => connection.node.label === "ExternalService");
  if (externalConnection) {
    return `${externalConnection.node.name} -> ${node.name}`;
  }

  if (node.exposureLevel === "INTERNET_EDGE") {
    return `External boundary -> ${node.name}`;
  }

  return "No explicit threat path has been extracted yet.";
}

export function isSyntheticNetworkContext(node: GraphNode) {
  return node.id === "external_network_context" || (node.label === "ExternalService" && node.name.toLowerCase().includes("external network context"));
}

function readableExposurePath(node: GraphNode, graph: GraphSnapshot) {
  return node.exposurePath?.map((id) => graph.nodes.find((item) => item.id === id)?.name ?? id) ?? [];
}
