import Link from "next/link";
import { AlertTriangle, ArrowRight, FolderKanban, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell";
import { prisma } from "@/lib/db";
import { requireUser } from "@/server/auth/guards";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { artifacts: true, remediations: true },
    orderBy: { updatedAt: "desc" }
  });
  const critical = projects.reduce((sum, project) => sum + project.remediations.filter((remediation) => remediation.priority === "CRITICAL").length, 0);
  const avgRisk = projects.length ? Math.round((projects.reduce((sum, project) => sum + project.riskScore, 0) / projects.length) * 10) / 10 : 0;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <section className="aether-panel aether-fade-up overflow-hidden rounded-lg">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_minmax(280px,0.75fr)] lg:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Workspace overview</p>
              <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50 lg:text-5xl">
                Hi {user.name?.split(" ")[0] ?? "there"}, what are we scanning today?
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                Review exposed cryptography, launch a new assessment, and keep the migration queue moving with one clean workspace.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/project/new" className="aether-button aether-button-primary px-4 py-3 text-sm font-medium">
                  New assessment <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="aether-chip rounded-full px-4 py-3 text-sm text-slate-300">
                  <Sparkles className="mr-2 inline h-4 w-4 text-[#32e6ff]" />
                  Deterministic-first analysis
                </span>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-lg border border-white/10 bg-[#08111f] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Current posture</p>
                <p className="mt-3 font-mono text-3xl text-slate-50">{avgRisk.toFixed(1)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Average project risk across your portfolio.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniInfo label="Projects" value={projects.length} icon={<FolderKanban className="h-4 w-4" />} />
                <MiniInfo label="Critical" value={critical} icon={<ShieldAlert className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric icon={<FolderKanban />} label="Projects" value={projects.length} />
          <Metric icon={<Radar />} label="Average Risk" value={avgRisk} />
          <Metric icon={<ShieldAlert />} label="Critical Actions" value={critical} />
        </div>

        <section className="aether-panel rounded-lg p-5 lg:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="aether-title text-xl font-semibold text-slate-50">Active threat matrix</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Projects are grouped by the most recent scan state and risk signal.</p>
            </div>
            <Link href="/project/new" className="aether-button aether-button-secondary px-4 py-3 text-sm">
              View assessment flow
            </Link>
          </div>

          <div className="grid gap-3">
            {projects.length === 0 ? (
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-white/12 bg-white/3 p-8 text-slate-400">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#08111f]">
                  <AlertTriangle className="h-5 w-5 text-[#32e6ff]" />
                </div>
                <div>
                  <p className="text-base text-slate-100">No projects have been initialized.</p>
                  <p className="mt-1 text-sm text-slate-400">Start with a new assessment and upload your first artifact.</p>
                </div>
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group grid gap-4 rounded-lg border border-white/10 bg-[#08111f] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#32e6ff]/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)] md:grid-cols-[1.4fr_0.5fr_0.4fr_auto]"
                >
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Project</p>
                    <h3 className="mt-2 text-base font-semibold text-slate-50">{project.name}</h3>
                    <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-slate-400">{project.description ?? "No description"}</p>
                  </div>
                  <div className="flex items-end">
                    <StatPill label="Artifacts" value={project.artifacts.length} />
                  </div>
                  <div className="flex items-end">
                    <StatPill label="Risk" value={project.riskScore.toFixed(1)} accent />
                  </div>
                  <div className="flex items-center justify-end text-slate-400 transition-colors group-hover:text-[#32e6ff]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MiniInfo({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] p-4">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[10px] uppercase tracking-[0.24em]">{label}</span>
        {icon}
      </div>
      <p className="mt-3 font-mono text-2xl text-slate-50">{value}</p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="aether-card rounded-lg p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#08111f] text-[#32e6ff]">{icon}</div>
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl text-slate-50">{value}</p>
    </div>
  );
}

function StatPill({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${accent ? "border-[#32e6ff]/25 bg-[#08111f]" : "border-white/10 bg-white/3"}`}>
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`mt-2 font-mono text-xl ${accent ? "text-[#32e6ff]" : "text-slate-50"}`}>{value}</p>
    </div>
  );
}
