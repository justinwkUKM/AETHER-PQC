import { isKnownWeakProtocol, scorePrimitive } from "@/lib/parsing/scoring";
import type { GraphNode, GraphSnapshot } from "@/types/graph";

export type PlatformExposureFinding = {
  id: string;
  name: string;
  label: GraphNode["label"];
  category: "Network edge" | "TLS / protocol" | "External service" | "Exposed crypto" | "Review";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  exposureScore: number;
  vulnerabilityScore: number;
  effectiveRiskScore: number;
  exposureLevel: GraphNode["exposureLevel"];
  exposurePath: string;
  reasons: string[];
  protocolHints: string[];
  ownerQuestion: string;
  action: string;
};

export type PlatformExposureSummary = {
  networkFacingCritical: number;
  tlsOrProtocolFindings: number;
  externalBoundaryCount: number;
  averageExposure: number;
  findings: PlatformExposureFinding[];
};

const protocolPattern = /\b(TLS\s*1[._-]?[0-3]|SSL|HTTPS|MTLS|RSA KEY EXCHANGE|STATIC DH|RC4|3DES|SHA-?1|CBC|EXPORT|NULL)\b/gi;
const networkPattern = /\b(public|internet|external|edge|gateway|ingress|load balancer|load-balancer|api gateway|reverse proxy|dmz|listener|endpoint|port|443|8443)\b/i;

export function buildPlatformExposureSummary(graph: GraphSnapshot): PlatformExposureSummary {
  const findings = graph.nodes
    .filter((node) => isPlatformRelevant(node))
    .map((node) => toFinding(node, graph))
    .sort((a, b) => b.effectiveRiskScore - a.effectiveRiskScore || b.exposureScore - a.exposureScore);

  const networkFacingCritical = findings.filter((finding) => finding.exposureLevel === "INTERNET_EDGE" && finding.effectiveRiskScore >= 8.5).length;
  const tlsOrProtocolFindings = findings.filter((finding) => finding.category === "TLS / protocol").length;
  const externalBoundaryCount = findings.filter((finding) => finding.category === "External service" || finding.exposureLevel === "INTERNET_EDGE").length;
  const averageExposure = findings.length
    ? Math.round((findings.reduce((sum, finding) => sum + finding.exposureScore, 0) / findings.length) * 10) / 10
    : 0;

  return {
    networkFacingCritical,
    tlsOrProtocolFindings,
    externalBoundaryCount,
    averageExposure,
    findings
  };
}

function isPlatformRelevant(node: GraphNode) {
  const text = nodeText(node);
  return node.exposureScore >= 5 || node.exposureLevel === "INTERNET_EDGE" || networkPattern.test(text) || protocolPattern.test(text);
}

function toFinding(node: GraphNode, graph: GraphSnapshot): PlatformExposureFinding {
  const text = nodeText(node);
  const protocolHints = extractProtocolHints(text);
  const deterministicProtocolScore = protocolHints.length > 0 ? Math.max(...protocolHints.map(scorePrimitive)) : 0;
  const vulnerabilityScore = Math.max(node.vulnerabilityScore, deterministicProtocolScore);
  const effectiveRiskScore = Math.max(node.effectiveRiskScore, vulnerabilityScore * (0.55 + 0.45 * node.exposureScore / 10));
  const category = categoryFor(node, text, protocolHints);
  const severity = severityFor(effectiveRiskScore, node.exposureScore);

  return {
    id: node.id,
    name: node.name,
    label: node.label,
    category,
    severity,
    exposureScore: node.exposureScore,
    vulnerabilityScore: Math.round(vulnerabilityScore * 10) / 10,
    effectiveRiskScore: Math.round(effectiveRiskScore * 10) / 10,
    exposureLevel: node.exposureLevel,
    exposurePath: readableExposurePath(node, graph),
    reasons: node.exposureReasons.length ? node.exposureReasons : ["Exposure inferred from connected topology or protocol context"],
    protocolHints,
    ownerQuestion: ownerQuestionFor(category),
    action: actionFor(category, protocolHints)
  };
}

function categoryFor(node: GraphNode, text: string, protocolHints: string[]): PlatformExposureFinding["category"] {
  if (protocolHints.length > 0 || isKnownWeakProtocol(text)) return "TLS / protocol";
  if (node.label === "ExternalService") return "External service";
  if (node.label === "CryptoAsset" && node.exposureScore >= 5) return "Exposed crypto";
  if (networkPattern.test(text) || node.exposureLevel === "INTERNET_EDGE") return "Network edge";
  return "Review";
}

function severityFor(effectiveRiskScore: number, exposureScore: number): PlatformExposureFinding["severity"] {
  if (effectiveRiskScore >= 8.5 || (effectiveRiskScore >= 7 && exposureScore >= 8)) return "CRITICAL";
  if (effectiveRiskScore >= 6.5 || exposureScore >= 8) return "HIGH";
  if (effectiveRiskScore >= 4 || exposureScore >= 5) return "MEDIUM";
  return "LOW";
}

function actionFor(category: PlatformExposureFinding["category"], protocolHints: string[]) {
  if (category === "TLS / protocol") {
    return protocolHints.some((hint) => /TLS\s*1[._-]?[01]|SSL|RC4|3DES|EXPORT|NULL/i.test(hint))
      ? "Retire the legacy protocol or weak cipher at the gateway, endpoint, or TLS termination point."
      : "Validate TLS 1.2 configuration and plan TLS 1.3 enablement where client compatibility allows.";
  }
  if (category === "Network edge") return "Validate ownership of the ingress path, then confirm whether exposed crypto should move into the remediation queue.";
  if (category === "External service") return "Confirm whether this boundary is vendor, partner, public, or internal-facing and attach the responsible owner.";
  if (category === "Exposed crypto") return "Prioritize migration with the platform or application owner closest to the exposure path.";
  return "Review the extracted context and confirm whether the platform team owns this exposure.";
}

function ownerQuestionFor(category: PlatformExposureFinding["category"]) {
  if (category === "TLS / protocol") return "Which team owns TLS termination, certificates, and cipher configuration for this endpoint?";
  if (category === "Network edge") return "Which platform or application owner controls this ingress path?";
  if (category === "External service") return "Is this boundary owned by a vendor, partner, platform team, or application team?";
  if (category === "Exposed crypto") return "Which service owner can approve migration along this exposure path?";
  return "Who can validate whether this extracted exposure is real and still active?";
}

function extractProtocolHints(text: string) {
  const matches = text.match(protocolPattern) ?? [];
  return [...new Set(matches.map((match) => match.toUpperCase().replaceAll("_", " ")))];
}

function readableExposurePath(node: GraphNode, graph: GraphSnapshot) {
  if (!node.exposurePath?.length) return "No explicit exposure path extracted.";
  return node.exposurePath.map((id) => graph.nodes.find((item) => item.id === id)?.name ?? id).join(" -> ");
}

function nodeText(node: GraphNode) {
  return `${node.label} ${node.name} ${JSON.stringify(node.attributes)} ${node.exposureReasons.join(" ")}`;
}
