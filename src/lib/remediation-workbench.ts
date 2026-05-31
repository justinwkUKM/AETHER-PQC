import type { RemediationPriority } from "@prisma/client";

export type RemediationActionItem = {
  title: string;
  detail: string;
  ownerQuestion?: string;
};

export type WorkbenchRemediation = {
  id: string;
  targetNode: string;
  threatPath: string;
  vulnerablePrimitive?: string | null;
  recommendedMigration?: string | null;
  priority: RemediationPriority;
  actionPlan: RemediationActionItem[];
  confidence: number;
  sourceArtifactIds: string[];
  createdAt: string;
};

export type ArtifactSummary = {
  id: string;
  name: string;
  type: string;
};

export type RemediationCategory = "Application action" | "Platform action" | "Vendor action" | "Architecture review";

const priorityRationale: Record<RemediationPriority, string> = {
  CRITICAL: "Prioritized because effective risk is critical or the finding appears close to an exposed boundary.",
  HIGH: "Prioritized because the finding combines meaningful crypto weakness with exposure or important system context.",
  MEDIUM: "Prioritized for planned migration or validation before it becomes externally exposed.",
  LOW: "Tracked for hygiene, validation, or future migration planning."
};

export function remediationCategory(remediation: Pick<WorkbenchRemediation, "threatPath" | "recommendedMigration" | "vulnerablePrimitive" | "confidence">): RemediationCategory {
  const text = `${remediation.threatPath} ${remediation.recommendedMigration ?? ""} ${remediation.vulnerablePrimitive ?? ""}`.toLowerCase();
  if (remediation.confidence < 0.6) return "Architecture review";
  if (/(vendor|third-party|third party|partner|external service)/.test(text)) return "Vendor action";
  if (/(tls|gateway|ingress|load balancer|proxy|endpoint|internet|dmz|port|public)/.test(text)) return "Platform action";
  return "Application action";
}

export function whyPrioritized(remediation: Pick<WorkbenchRemediation, "priority" | "confidence" | "threatPath">) {
  const confidenceText = remediation.confidence >= 0.85
    ? "confidence is high"
    : remediation.confidence >= 0.6
      ? "confidence is moderate and should be reviewed during planning"
      : "confidence is low and needs architecture review";

  return `${priorityRationale[remediation.priority]} The extraction ${confidenceText}. ${remediation.threatPath}`;
}

export function validationSteps(remediation: Pick<WorkbenchRemediation, "vulnerablePrimitive" | "priority">) {
  const primitive = remediation.vulnerablePrimitive ?? "the affected primitive or protocol";
  return [
    `Confirm ${primitive} is present in the deployed runtime, configuration, certificate path, dependency, or vendor integration.`,
    "Confirm whether the affected path is internet-facing, partner-facing, or internal-only.",
    "Validate the migration in a staging environment with compatibility, performance, rollback, and monitoring checks.",
    remediation.priority === "CRITICAL"
      ? "Run a post-change scan and confirm the critical remediation no longer appears in the queue."
      : "Run a post-change scan and confirm the risk score, evidence, and remediation state are updated."
  ];
}

export function openQuestions(remediation: WorkbenchRemediation) {
  const questions = remediation.actionPlan
    .map((action) => action.ownerQuestion)
    .filter((question): question is string => Boolean(question));

  if (questions.length > 0) return questions;

  return [
    "Who owns the affected application, gateway, dependency, or vendor relationship?",
    "Is there a production migration window or compatibility constraint?",
    "Which team can validate that the exposure path is accurate?"
  ];
}

export function evidenceNames(remediation: Pick<WorkbenchRemediation, "sourceArtifactIds">, artifacts: ArtifactSummary[]) {
  const artifactMap = new Map(artifacts.map((artifact) => [artifact.id, artifact.name]));
  return remediation.sourceArtifactIds.map((id) => artifactMap.get(id) ?? `${id.slice(0, 8)}...`);
}

export function ticketMarkdown(remediation: WorkbenchRemediation, artifacts: ArtifactSummary[]) {
  const category = remediationCategory(remediation);
  const evidence = evidenceNames(remediation, artifacts);
  const validation = validationSteps(remediation);
  const questions = openQuestions(remediation);

  return `# ${remediation.priority}: ${remediation.targetNode} PQC remediation

## Category
${category}

## Why this is prioritized
${whyPrioritized(remediation)}

## What to change
${remediation.recommendedMigration ?? "Review the affected cryptographic posture and define the migration target."}

## Vulnerable primitive or protocol
${remediation.vulnerablePrimitive ?? "Not specified"}

## Evidence
${evidence.length > 0 ? evidence.map((item) => `- ${item}`).join("\n") : "- No source artifact attached"}

## Validation steps
${validation.map((step) => `- [ ] ${step}`).join("\n")}

## Open questions
${questions.map((question) => `- ${question}`).join("\n")}
`;
}
