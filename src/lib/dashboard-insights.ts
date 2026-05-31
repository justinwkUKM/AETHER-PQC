import { enrichGraphExposure } from "@/lib/exposure";
import { parseGraphSnapshot } from "@/lib/graph";
import type { GraphSnapshot } from "@/types/graph";

export type DashboardProjectInput = {
  id: string;
  name: string;
  description?: string | null;
  riskScore: number;
  graphSnapshot: unknown;
  lastScanAt?: Date | string | null;
  updatedAt: Date | string;
  artifacts: unknown[];
  remediations: Array<{ priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" }>;
};

export type DashboardProjectInsight = {
  id: string;
  name: string;
  description?: string | null;
  riskScore: number;
  artifactCount: number;
  remediationCount: number;
  criticalRemediations: number;
  highestExposure: number;
  criticalExposedFindings: number;
  lastScanLabel: string;
  actionLabel: string;
};

export type DashboardInsights = {
  readinessScore: number;
  averageRisk: number;
  criticalRemediations: number;
  criticalExposedFindings: number;
  totalProjects: number;
  totalArtifacts: number;
  totalRemediations: number;
  needsAction: number;
  highestRiskProjects: DashboardProjectInsight[];
  recentProjects: DashboardProjectInsight[];
};

export function buildDashboardInsights(projects: DashboardProjectInput[]): DashboardInsights {
  const projectInsights = projects.map(toProjectInsight);
  const totalProjects = projectInsights.length;
  const totalArtifacts = projectInsights.reduce((sum, project) => sum + project.artifactCount, 0);
  const totalRemediations = projectInsights.reduce((sum, project) => sum + project.remediationCount, 0);
  const criticalRemediations = projectInsights.reduce((sum, project) => sum + project.criticalRemediations, 0);
  const criticalExposedFindings = projectInsights.reduce((sum, project) => sum + project.criticalExposedFindings, 0);
  const averageRisk = totalProjects
    ? round1(projectInsights.reduce((sum, project) => sum + project.riskScore, 0) / totalProjects)
    : 0;
  const needsAction = projectInsights.filter((project) => project.criticalRemediations > 0 || project.criticalExposedFindings > 0 || project.riskScore >= 7).length;
  const readinessScore = totalProjects === 0
    ? 0
    : Math.max(0, Math.min(100, Math.round(100 - averageRisk * 8 - criticalExposedFindings * 4 - criticalRemediations * 2)));

  return {
    readinessScore,
    averageRisk,
    criticalRemediations,
    criticalExposedFindings,
    totalProjects,
    totalArtifacts,
    totalRemediations,
    needsAction,
    highestRiskProjects: [...projectInsights].sort((a, b) => b.riskScore - a.riskScore || b.criticalExposedFindings - a.criticalExposedFindings).slice(0, 4),
    recentProjects: projectInsights.slice(0, 5)
  };
}

function toProjectInsight(project: DashboardProjectInput): DashboardProjectInsight {
  const graph = enrichGraphExposure(parseGraphSnapshot(project.graphSnapshot));
  const highestExposure = highestExposureFor(graph);
  const criticalExposedFindings = graph.nodes.filter((node) => (node.effectiveRiskScore || node.vulnerabilityScore) >= 8.5 && node.exposureLevel === "INTERNET_EDGE").length;
  const criticalRemediations = project.remediations.filter((remediation) => remediation.priority === "CRITICAL").length;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    riskScore: project.riskScore,
    artifactCount: project.artifacts.length,
    remediationCount: project.remediations.length,
    criticalRemediations,
    highestExposure,
    criticalExposedFindings,
    lastScanLabel: project.lastScanAt ? formatDate(project.lastScanAt) : "Awaiting scan",
    actionLabel: actionLabel(project.riskScore, criticalRemediations, criticalExposedFindings)
  };
}

function highestExposureFor(graph: GraphSnapshot) {
  return round1(graph.nodes.reduce((max, node) => Math.max(max, node.exposureScore), 0));
}

function actionLabel(riskScore: number, criticalRemediations: number, criticalExposedFindings: number) {
  if (criticalExposedFindings > 0) return "Escalate exposed crypto";
  if (criticalRemediations > 0) return "Drive critical remediation";
  if (riskScore >= 7) return "Review high-risk topology";
  if (riskScore >= 4) return "Plan migration queue";
  return "Monitor posture";
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
