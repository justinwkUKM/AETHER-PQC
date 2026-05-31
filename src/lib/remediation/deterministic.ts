import { isKnownClassicalPublicKey } from "@/lib/parsing/scoring";
import { enrichGraphExposure } from "@/lib/exposure";
import type { GraphSnapshot } from "@/types/graph";
import type { RemediationPlan } from "@/types/remediation";

function priorityForScore(score: number) {
  if (score >= 8.5) return "CRITICAL" as const;
  if (score >= 6.5) return "HIGH" as const;
  if (score >= 4) return "MEDIUM" as const;
  return "LOW" as const;
}

export function generateDeterministicRemediations(graph: GraphSnapshot): RemediationPlan[] {
  const enriched = enrichGraphExposure(graph);
  return enriched.nodes
    .filter((node) => node.label === "CryptoAsset" && node.vulnerabilityScore >= 4)
    .map((node) => {
      const classical = isKnownClassicalPublicKey(node.name);
      const exposureSummary = node.exposureReasons.length ? node.exposureReasons.join("; ") : "No exposure reason detected.";
      const exposurePath = node.exposurePath?.join(" -> ") ?? "No explicit exposure path.";
      return {
        targetNode: node.id,
        threatPath: `Crypto asset ${node.name} is present in the assessed topology. Exposure: ${node.exposureLevel} (${node.exposureScore.toFixed(1)}/10). Path: ${exposurePath}`,
        vulnerablePrimitive: node.name,
        recommendedMigration: classical ? "Plan migration to NIST PQC standards such as ML-KEM or ML-DSA." : "Review cryptographic posture and validate PQC readiness.",
        priority: priorityForScore(node.effectiveRiskScore || node.vulnerabilityScore),
        confidence: node.confidence,
        sourceArtifactIds: node.sourceArtifactIds,
        residualRiskNotes: `Effective risk ${node.effectiveRiskScore.toFixed(1)}/10 combines vulnerability ${node.vulnerabilityScore.toFixed(1)}/10 and exposure ${node.exposureScore.toFixed(1)}/10. ${exposureSummary}`,
        actionPlan: [
          {
            title: "Confirm ownership and usage",
            detail: `Identify the system owner and business process using ${node.name}, prioritizing the exposure path: ${exposurePath}.`,
            ownerQuestion: "Which service owner can approve a cryptographic migration window?"
          },
          {
            title: "Validate exposure boundary",
            detail: `Confirm whether this primitive is reachable through ${node.exposureLevel.toLowerCase().replace("_", " ")} paths. Evidence: ${exposureSummary}`
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
