import { AppShell } from "@/components/shell";
import { requireProject, requireUser } from "@/server/auth/guards";

const priorityColor = {
  CRITICAL: "text-rose-300 border-rose-500",
  HIGH: "text-amber-300 border-amber-500",
  MEDIUM: "text-cyan-300 border-cyan-500",
  LOW: "text-emerald-300 border-emerald-500"
};

export default async function RemediationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);

  return (
    <AppShell userName={user.name}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Migration Work Queue</p>
      <h1 className="mt-2 text-3xl font-semibold">{project.name}</h1>
      <div className="mt-6 grid gap-4">
        {project.remediations.length === 0 ? (
          <div className="aether-panel p-8 text-sm text-slate-500">No remediations generated yet.</div>
        ) : (
          project.remediations.map((remediation) => {
            const actions = remediation.actionPlan as Array<{ title: string; detail: string; ownerQuestion?: string }>;
            return (
              <article key={remediation.id} className={`border bg-[#0b0f19] p-5 ${priorityColor[remediation.priority]}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-mono text-sm text-slate-100">{remediation.targetNode}</h2>
                  <span className="border px-2 py-1 font-mono text-xs">{remediation.priority}</span>
                </div>
                <p className="text-sm text-slate-400">{remediation.threatPath}</p>
                <p className="mt-2 text-sm text-slate-500">{remediation.recommendedMigration}</p>
                <div className="mt-4 grid gap-2">
                  {actions.map((action) => (
                    <div key={action.title} className="border border-[#1f2d44] bg-[#030712] p-3">
                      <h3 className="text-sm text-slate-200">{action.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{action.detail}</p>
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
