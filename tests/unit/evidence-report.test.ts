import { describe, expect, it } from "vitest";
import { buildEvidenceReport, type EvidenceProject } from "@/lib/evidence-report";

const project: EvidenceProject = {
  id: "project-1",
  name: "Payment Gateway",
  description: "PQC audit scope",
  riskScore: 8.5,
  lastScanAt: "2026-06-01T00:00:00.000Z",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  artifacts: [
    {
      id: "artifact-1",
      name: "gateway-diagram.png",
      type: "image",
      mimeType: "image/png",
      sizeBytes: 2048,
      parseStatus: "COMPLETED",
      parserMode: "AI_MULTIMODAL",
      aiModel: "gemini-3.5-flash",
      confidence: 0.87,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z"
    },
    {
      id: "artifact-2",
      name: "bad.csv",
      type: "text",
      mimeType: "text/csv",
      sizeBytes: 512,
      parseStatus: "FAILED",
      parserMode: "DETERMINISTIC",
      parseError: "Malformed CSV",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z"
    }
  ],
  remediations: [
    {
      id: "rem-1",
      priority: "CRITICAL",
      targetNode: "rsa",
      vulnerablePrimitive: "RSA",
      confidence: 0.9,
      sourceArtifactIds: ["artifact-1"],
      createdAt: "2026-06-01T00:00:00.000Z"
    },
    {
      id: "rem-2",
      priority: "LOW",
      targetNode: "sha",
      confidence: 0.6,
      sourceArtifactIds: [],
      createdAt: "2026-06-01T00:00:00.000Z"
    }
  ],
  scanEvents: [
    {
      id: "event-1",
      level: "SUCCESS",
      message: "Scan completed",
      artifactId: "artifact-1",
      createdAt: "2026-06-01T00:00:00.000Z"
    }
  ]
};

describe("evidence report", () => {
  it("summarizes audit evidence, parser modes, and remediation coverage", () => {
    const report = buildEvidenceReport(project);

    expect(report.summary.artifactCount).toBe(2);
    expect(report.summary.aiAssistedArtifactCount).toBe(1);
    expect(report.summary.failedArtifactCount).toBe(1);
    expect(report.summary.criticalRemediationCount).toBe(1);
    expect(report.summary.evidenceCoverage).toBe(50);
    expect(report.artifactsByStatus.COMPLETED).toBe(1);
    expect(report.parserModes.AI_MULTIMODAL).toBe(1);
    expect(report.methodology.scoring).toContain("Effective risk");
  });
});
