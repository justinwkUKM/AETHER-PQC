import { AppShell } from "@/components/shell";
import { requireProject, requireUser } from "@/server/auth/guards";

const priorityColor = {
  CRITICAL: "border-rose-500/30 text-rose-200",
  HIGH: "border-amber-500/30 text-amber-200",
  MEDIUM: "border-cyan-500/30 text-cyan-200",
  LOW: "border-emerald-500/30 text-emerald-200"
};

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
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#05ffd1]">Migration work queue</p>
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
        {project.remediations.length === 0 ? (
          <div className="aether-card rounded-lg p-8 text-sm leading-7 text-slate-400">No remediations generated yet. Upload an artifact to trigger the first plan.</div>
        ) : (
          project.remediations.map((remediation) => {
            const actions = remediation.actionPlan as Array<{ title: string; detail: string; ownerQuestion?: string }>;
            return (
              <article key={remediation.id} className={`rounded-lg border bg-[#08111f] p-5 ${priorityColor[remediation.priority]}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Target node</p>
                    <h2 className="mt-2 text-base font-semibold text-slate-50">{remediation.targetNode}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-xs">{remediation.priority}</span>
                </div>
                <p className="text-sm leading-7 text-slate-300">{remediation.threatPath}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{remediation.recommendedMigration}</p>
                <div className="mt-4 grid gap-3">
                  {actions.map((action) => (
                    <div key={action.title} className="rounded-md border border-white/10 bg-[#050a14] p-4">
                      <h3 className="text-sm font-medium text-slate-100">{action.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{action.detail}</p>
                      {action.ownerQuestion ? <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{action.ownerQuestion}</p> : null}
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-xl text-slate-50">{value}</p>
    </div>
  );
}
