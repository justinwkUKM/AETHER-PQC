import { AppShell } from "@/components/shell";
import { RemediationWorkbench } from "@/components/project/remediation-workbench";
import { requireProject, requireUser } from "@/server/auth/guards";
import type { RemediationActionItem } from "@/lib/remediation-workbench";

export default async function RemediationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);
  return (
    <AppShell
      user={user}
      projectId={project.id}
      projectName={project.name}
      projectRisk={project.riskScore}
      artifactCount={project.artifacts.length}
      remediationCount={project.remediations.length}
      lastScanLabel={project.lastScanAt ? project.lastScanAt.toLocaleString() : "Awaiting scan"}
    >
      <section className="aether-panel aether-fade-up rounded-lg overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_minmax(260px,0.9fr)] lg:p-8">
          <div>
            <p className="text-xs font-medium text-[var(--accent-cyan)]">Migration work queue</p>
            <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50">{project.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Convert high-risk cryptography findings into concrete migration tasks with owner questions, validation steps, and residual
              risk notes.
            </p>
          </div>
          <div className="grid gap-3">
            <QuickStat label="Remediations" value={project.remediations.length.toString()} />
            <QuickStat label="Critical" value={project.remediations.filter((item) => item.priority === "CRITICAL").length.toString()} />
            <QuickStat label="High" value={project.remediations.filter((item) => item.priority === "HIGH").length.toString()} />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4">
        <RemediationWorkbench
          artifacts={project.artifacts.map((artifact) => ({
            id: artifact.id,
            name: artifact.name,
            type: artifact.type
          }))}
          remediations={project.remediations.map((remediation) => ({
            id: remediation.id,
            targetNode: remediation.targetNode,
            threatPath: remediation.threatPath,
            vulnerablePrimitive: remediation.vulnerablePrimitive,
            recommendedMigration: remediation.recommendedMigration,
            priority: remediation.priority,
            actionPlan: normalizeActionPlan(remediation.actionPlan),
            confidence: remediation.confidence,
            sourceArtifactIds: remediation.sourceArtifactIds,
            createdAt: remediation.createdAt.toISOString()
          }))}
        />
      </div>
    </AppShell>
  );
}

function normalizeActionPlan(value: unknown): RemediationActionItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const action = item as Record<string, unknown>;
    if (typeof action.title !== "string" || typeof action.detail !== "string") return [];
    return [
      {
        title: action.title,
        detail: action.detail,
        ownerQuestion: typeof action.ownerQuestion === "string" ? action.ownerQuestion : undefined
      }
    ];
  });
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-xl text-slate-50">{value}</p>
    </div>
  );
}
