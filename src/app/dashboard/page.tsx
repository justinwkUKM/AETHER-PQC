import Link from "next/link";
import { AlertTriangle, FolderKanban, Radar, ShieldAlert } from "lucide-react";
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
    <AppShell userName={user.name}>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric icon={<FolderKanban />} label="Projects" value={projects.length} />
        <Metric icon={<Radar />} label="Average Risk" value={avgRisk} />
        <Metric icon={<ShieldAlert />} label="Critical Actions" value={critical} />
      </div>
      <section className="aether-panel p-5">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-mono text-sm font-bold tracking-[0.18em] text-[#00f0ff]">ACTIVE THREAT MATRIX</h1>
          <Link href="/project/new" className="border border-[#00f0ff] px-3 py-2 font-mono text-xs text-[#00f0ff] hover:bg-[#00f0ff]/10">
            NEW CORE ASSESSMENT
          </Link>
        </div>
        <div className="grid gap-3">
          {projects.length === 0 ? (
            <div className="flex items-center gap-3 border border-dashed border-[#1f2d44] p-8 text-slate-500">
              <AlertTriangle className="h-5 w-5" />
              No projects have been initialized.
            </div>
          ) : (
            projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`} className="grid gap-3 border border-[#1f2d44] bg-[#030712] p-4 hover:border-[#00f0ff]/60 md:grid-cols-4">
                <div className="md:col-span-2">
                  <h2 className="font-mono text-sm text-slate-100">{project.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{project.description ?? "No description"}</p>
                </div>
                <span className="text-xs text-slate-400">{project.artifacts.length} artifacts</span>
                <span className="text-xs text-[#00f0ff]">Risk {project.riskScore.toFixed(1)}</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="aether-panel p-5">
      <div className="mb-4 flex h-8 w-8 items-center justify-center text-[#00f0ff]">{icon}</div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl text-slate-100">{value}</p>
    </div>
  );
}
