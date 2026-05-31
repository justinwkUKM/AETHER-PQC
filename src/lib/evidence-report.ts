export type EvidenceArtifact = {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  parseStatus: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  parserMode?: "DETERMINISTIC" | "AI_MULTIMODAL" | "HYBRID" | null;
  aiModel?: string | null;
  confidence?: number | null;
  parseError?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type EvidenceRemediation = {
  id: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  targetNode: string;
  vulnerablePrimitive?: string | null;
  confidence: number;
  sourceArtifactIds: string[];
  createdAt: Date | string;
};

export type EvidenceScanEvent = {
  id: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  message: string;
  artifactId?: string | null;
  createdAt: Date | string;
};

export type EvidenceProject = {
  id: string;
  name: string;
  description?: string | null;
  riskScore: number;
  lastScanAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  artifacts: EvidenceArtifact[];
  remediations: EvidenceRemediation[];
  scanEvents: EvidenceScanEvent[];
};

export function buildEvidenceReport(project: EvidenceProject) {
  const artifactsByStatus = countBy(project.artifacts, (artifact) => artifact.parseStatus);
  const parserModes = countBy(project.artifacts, (artifact) => artifact.parserMode ?? "UNASSIGNED");
  const remediationPriorities = countBy(project.remediations, (remediation) => remediation.priority);
  const aiArtifacts = project.artifacts.filter((artifact) => artifact.parserMode === "AI_MULTIMODAL" || artifact.parserMode === "HYBRID");
  const failedArtifacts = project.artifacts.filter((artifact) => artifact.parseStatus === "FAILED");
  const evidenceCoverage = project.remediations.length === 0
    ? 0
    : Math.round((project.remediations.filter((remediation) => remediation.sourceArtifactIds.length > 0).length / project.remediations.length) * 100);

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      riskScore: project.riskScore,
      lastScanAt: project.lastScanAt ? iso(project.lastScanAt) : null,
      createdAt: iso(project.createdAt),
      updatedAt: iso(project.updatedAt)
    },
    summary: {
      artifactCount: project.artifacts.length,
      remediationCount: project.remediations.length,
      scanEventCount: project.scanEvents.length,
      criticalRemediationCount: remediationPriorities.CRITICAL ?? 0,
      aiAssistedArtifactCount: aiArtifacts.length,
      failedArtifactCount: failedArtifacts.length,
      evidenceCoverage
    },
    methodology: {
      scoring: "Effective risk blends cryptographic vulnerability with exposure-aware reachability. Deterministic known-crypto scoring takes precedence over AI suggestions.",
      extraction: "Structured crypto is parsed deterministically first. Gemini Developer API multimodal extraction supports screenshots, diagrams, scanned PDFs, and ambiguous documents.",
      governance: "Artifacts, scan events, graph findings, remediation records, confidence, and source artifact references form the audit trail."
    },
    artifactsByStatus,
    parserModes,
    remediationPriorities,
    artifacts: project.artifacts.map((artifact) => ({
      id: artifact.id,
      name: artifact.name,
      type: artifact.type,
      mimeType: artifact.mimeType,
      sizeBytes: artifact.sizeBytes,
      parseStatus: artifact.parseStatus,
      parserMode: artifact.parserMode ?? "UNASSIGNED",
      aiModel: artifact.aiModel,
      confidence: artifact.confidence,
      parseError: artifact.parseError,
      createdAt: iso(artifact.createdAt),
      updatedAt: iso(artifact.updatedAt)
    })),
    remediations: project.remediations.map((remediation) => ({
      id: remediation.id,
      priority: remediation.priority,
      targetNode: remediation.targetNode,
      vulnerablePrimitive: remediation.vulnerablePrimitive,
      confidence: remediation.confidence,
      sourceArtifactIds: remediation.sourceArtifactIds,
      createdAt: iso(remediation.createdAt)
    })),
    scanEvents: project.scanEvents.map((event) => ({
      id: event.id,
      level: event.level,
      message: event.message,
      artifactId: event.artifactId,
      createdAt: iso(event.createdAt)
    }))
  };
}

function countBy<T>(items: T[], keyFor: (item: T) => string) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function iso(value: Date | string) {
  return new Date(value).toISOString();
}
