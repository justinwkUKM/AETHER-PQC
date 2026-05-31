import { describe, expect, it } from "vitest";
import {
  evidenceNames,
  openQuestions,
  remediationCategory,
  ticketMarkdown,
  validationSteps,
  whyPrioritized,
  type WorkbenchRemediation
} from "@/lib/remediation-workbench";

const remediation: WorkbenchRemediation = {
  id: "rem-1",
  targetNode: "crypto_rsa",
  threatPath: "Crypto asset RSA is present. Exposure: INTERNET_EDGE. Path: public gateway -> rsa",
  vulnerablePrimitive: "RSA",
  recommendedMigration: "Plan migration to ML-KEM or ML-DSA.",
  priority: "CRITICAL",
  actionPlan: [
    {
      title: "Confirm ownership",
      detail: "Find the owning service.",
      ownerQuestion: "Which service owner can approve the migration window?"
    }
  ],
  confidence: 0.92,
  sourceArtifactIds: ["artifact-1"],
  createdAt: "2026-06-01T00:00:00.000Z"
};

describe("remediation workbench helpers", () => {
  it("categorizes internet and gateway findings as platform action", () => {
    expect(remediationCategory(remediation)).toBe("Platform action");
  });

  it("routes low-confidence items to architecture review", () => {
    expect(remediationCategory({ ...remediation, confidence: 0.4 })).toBe("Architecture review");
  });

  it("maps evidence ids to artifact names", () => {
    expect(evidenceNames(remediation, [{ id: "artifact-1", name: "tls-report.md", type: "text/markdown" }])).toEqual(["tls-report.md"]);
  });

  it("creates priority rationale and validation steps", () => {
    expect(whyPrioritized(remediation)).toContain("critical");
    expect(validationSteps(remediation)).toHaveLength(4);
    expect(validationSteps(remediation)[3]).toContain("critical remediation");
  });

  it("uses action owner questions and generates ticket markdown", () => {
    expect(openQuestions(remediation)).toEqual(["Which service owner can approve the migration window?"]);
    const ticket = ticketMarkdown(remediation, [{ id: "artifact-1", name: "tls-report.md", type: "text/markdown" }]);
    expect(ticket).toContain("# CRITICAL: crypto_rsa PQC remediation");
    expect(ticket).toContain("tls-report.md");
    expect(ticket).toContain("Plan migration to ML-KEM");
  });
});
