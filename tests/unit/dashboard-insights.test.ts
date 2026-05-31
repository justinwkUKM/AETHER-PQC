import { describe, expect, it } from "vitest";
import { buildDashboardInsights, type DashboardProjectInput } from "@/lib/dashboard-insights";

function project(overrides: Partial<DashboardProjectInput>): DashboardProjectInput {
  return {
    id: "project",
    name: "Project",
    description: null,
    riskScore: 0,
    graphSnapshot: { nodes: [], edges: [] },
    lastScanAt: null,
    updatedAt: "2026-06-01T00:00:00.000Z",
    artifacts: [],
    remediations: [],
    ...overrides
  };
}

describe("dashboard insights", () => {
  it("calculates executive readiness and critical exposed findings", () => {
    const insights = buildDashboardInsights([
      project({
        id: "edge",
        name: "Edge Gateway",
        riskScore: 9,
        artifacts: [{}],
        remediations: [{ priority: "CRITICAL" }],
        graphSnapshot: {
          nodes: [
            {
              id: "rsa",
              label: "CryptoAsset",
              name: "RSA",
              vulnerabilityScore: 10,
              exposureScore: 10,
              exposureLevel: "INTERNET_EDGE",
              effectiveRiskScore: 10,
              exposureReasons: ["Public gateway"],
              confidence: 1,
              sourceArtifactIds: [],
              attributes: {}
            }
          ],
          edges: []
        }
      })
    ]);

    expect(insights.totalProjects).toBe(1);
    expect(insights.criticalRemediations).toBe(1);
    expect(insights.criticalExposedFindings).toBe(1);
    expect(insights.needsAction).toBe(1);
    expect(insights.readinessScore).toBeLessThan(50);
  });

  it("orders highest-risk projects for executive triage", () => {
    const insights = buildDashboardInsights([
      project({ id: "low", name: "Low", riskScore: 2 }),
      project({ id: "high", name: "High", riskScore: 8 })
    ]);

    expect(insights.highestRiskProjects[0].id).toBe("high");
    expect(insights.highestRiskProjects[0].actionLabel).toBe("Review high-risk topology");
    expect(insights.averageRisk).toBe(5);
  });
});
