import { isKnownClassicalPublicKey, isKnownQuantumSafe, isKnownWeakProtocol, scorePrimitive } from "@/lib/parsing/scoring";
import type { GraphNode, GraphSnapshot } from "@/types/graph";

export type InventoryArtifact = {
  id: string;
  name: string;
  type: string;
  parserMode?: string | null;
};

export type CryptoInventoryItem = {
  id: string;
  name: string;
  kind: "Primitive" | "Protocol" | "Crypto context";
  posture: "Vulnerable" | "Review" | "Quantum-safe";
  reviewStatus: "Ready for migration" | "Needs review" | "Monitor";
  vulnerabilityScore: number;
  exposureScore: number;
  effectiveRiskScore: number;
  exposureLevel: GraphNode["exposureLevel"];
  confidence: number;
  parserModes: string[];
  sourceArtifacts: InventoryArtifact[];
  migrationTarget: string;
  rationale: string;
};

const protocolPattern = /\b(TLS|SSL|HTTPS|MTLS|CIPHER|CERTIFICATE|X\.509)\b/i;

export function buildCryptoInventory(graph: GraphSnapshot, artifacts: InventoryArtifact[]): CryptoInventoryItem[] {
  const artifactMap = new Map(artifacts.map((artifact) => [artifact.id, artifact]));

  return graph.nodes
    .filter((node) => isCryptoInventoryNode(node))
    .map((node) => {
      const sourceArtifacts = node.sourceArtifactIds.flatMap((id) => {
        const artifact = artifactMap.get(id);
        return artifact ? [artifact] : [];
      });
      const parserModes = unique(sourceArtifacts.map((artifact) => artifact.parserMode ?? "UNKNOWN"));
      const primitiveName = primitiveDisplayName(node);
      const deterministicScore = scorePrimitive(`${node.name} ${primitiveName}`);
      const score = Math.max(node.vulnerabilityScore, deterministicScore);
      const posture = postureFor(node, primitiveName, score);
      const reviewStatus = reviewStatusFor(node, posture);

      return {
        id: node.id,
        name: primitiveName,
        kind: kindFor(node, primitiveName),
        posture,
        reviewStatus,
        vulnerabilityScore: score,
        exposureScore: node.exposureScore,
        effectiveRiskScore: node.effectiveRiskScore || score,
        exposureLevel: node.exposureLevel,
        confidence: node.confidence,
        parserModes,
        sourceArtifacts,
        migrationTarget: migrationTargetFor(primitiveName, posture),
        rationale: rationaleFor(node, primitiveName, score)
      };
    })
    .sort((a, b) => b.effectiveRiskScore - a.effectiveRiskScore || b.exposureScore - a.exposureScore);
}

function isCryptoInventoryNode(node: GraphNode) {
  if (node.label === "CryptoAsset") return true;
  const values = Object.values(node.attributes).join(" ");
  return /(rsa|dsa|ecdsa|ecdh|dh|tls|ssl|aes|sha|ml-kem|ml-dsa|slh-dsa)/i.test(`${node.name} ${values}`);
}

function primitiveDisplayName(node: GraphNode) {
  const candidate = [node.attributes.encryptionStandard, node.attributes.algorithm, node.attributes.protocol, node.attributes.cipherSuite]
    .find((value) => typeof value === "string" && value.trim().length > 0);
  return typeof candidate === "string" ? candidate : node.name;
}

function kindFor(node: GraphNode, name: string): CryptoInventoryItem["kind"] {
  if (protocolPattern.test(`${node.name} ${name}`)) return "Protocol";
  if (node.label === "CryptoAsset") return "Primitive";
  return "Crypto context";
}

function postureFor(node: GraphNode, name: string, score: number): CryptoInventoryItem["posture"] {
  if (isKnownQuantumSafe(name) || score <= 1) return "Quantum-safe";
  if (isKnownClassicalPublicKey(name) || isKnownWeakProtocol(name) || score >= 8) return "Vulnerable";
  return node.confidence < 0.65 ? "Review" : "Review";
}

function reviewStatusFor(node: GraphNode, posture: CryptoInventoryItem["posture"]): CryptoInventoryItem["reviewStatus"] {
  if (node.confidence < 0.65) return "Needs review";
  if (posture === "Vulnerable") return "Ready for migration";
  return "Monitor";
}

function migrationTargetFor(name: string, posture: CryptoInventoryItem["posture"]) {
  if (posture === "Quantum-safe") return "Maintain current approved posture and monitor evidence.";
  if (/\bTLS\s*1[._-]?[012]\b|\bSSL\b/i.test(name)) return "Move endpoint and clients to TLS 1.3 with approved cipher suites.";
  if (/\b(RSA|DH|ECDH)\b/i.test(name)) return "Plan hybrid or PQC key establishment using ML-KEM where applicable.";
  if (/\b(DSA|ECDSA)\b/i.test(name)) return "Plan signature migration to ML-DSA or SLH-DSA where applicable.";
  return "Review usage and select an approved PQC or compensating-control path.";
}

function rationaleFor(node: GraphNode, name: string, score: number) {
  if (score >= 8) {
    return `${name} is scored as high-risk classical or legacy cryptography. Exposure ${node.exposureScore.toFixed(1)}/10 changes migration urgency.`;
  }
  if (score <= 1) {
    return `${name} appears quantum-safe or low-risk in the current evidence. Keep it visible for audit and drift monitoring.`;
  }
  return `${name} needs review because the primitive, protocol context, or extracted evidence is not sufficient for automatic migration approval.`;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
