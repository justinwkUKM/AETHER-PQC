import { isKnownClassicalPublicKey } from "@/lib/parsing/scoring";
import type { GraphSnapshot } from "@/types/graph";
import type { RemediationPlan } from "@/types/remediation";

function priorityForScore(score: number) {
  if (score >= 9) return "CRITICAL" as const;
  if (score >= 7) return "HIGH" as const;
  if (score >= 4) return "MEDIUM" as const;
  return "LOW" as const;
}

export function generateDeterministicRemediations(graph: GraphSnapshot): RemediationPlan[] {
  return graph.nodes
    .filter((node) => node.label === "CryptoAsset" && node.vulnerabilityScore >= 4)
    .map((node) => {
      const classical = isKnownClassicalPublicKey(node.name);
      return {
        targetNode: node.id,
        threatPath: `Crypto asset ${node.name} is present in the assessed topology.`,
        vulnerablePrimitive: node.name,
        recommendedMigration: classical ? "Plan migration to NIST PQC standards such as ML-KEM or ML-DSA." : "Review cryptographic posture and validate PQC readiness.",
        priority: priorityForScore(node.vulnerabilityScore),
        confidence: node.confidence,
        sourceArtifactIds: node.sourceArtifactIds,
        actionPlan: [
          {
            title: "Confirm ownership and usage",
            detail: `Identify the system owner and business process using ${node.name}.`,
            ownerQuestion: "Which service owner can approve a cryptographic migration window?"
          },
          {
            title: "Select migration target",
            detail: classical ? "Replace or hybridize vulnerable public-key usage with ML-KEM/ML-DSA compatible libraries." : "Validate whether the primitive needs compensating controls."
          },
          {
            title: "Validate interoperability",
            detail: "Run compatibility, performance, rollback, and compliance checks before production rollout."
          }
        ]
      };
    });
}
