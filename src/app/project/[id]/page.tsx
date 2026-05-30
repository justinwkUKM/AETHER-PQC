import Link from "next/link";
import { AppShell } from "@/components/shell";
import { RiskGraph } from "@/components/graph/risk-graph";
import { parseGraphSnapshot } from "@/lib/graph";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);
  const graph = parseGraphSnapshot(project.graphSnapshot);

  return (
    <AppShell userName={user.name}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Project Core</p>
          <h1 className="mt-2 text-3xl font-semibold">{project.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{project.description}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/project/${project.id}/scan`} className="border border-[#00f0ff] px-4 py-2 font-mono text-xs text-[#00f0ff] hover:bg-[#00f0ff]/10">
            SCAN
          </Link>
          <Link href={`/project/${project.id}/remediations`} className="border border-[#1f2d44] px-4 py-2 font-mono text-xs text-slate-300 hover:border-[#00f0ff]/60">
            REMEDIATIONS
          </Link>
        </div>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat label="Risk Score" value={project.riskScore.toFixed(1)} />
        <Stat label="Artifacts" value={project.artifacts.length.toString()} />
        <Stat label="Remediations" value={project.remediations.length.toString()} />
      </div>
      <section className="aether-panel p-5">
        <h2 className="mb-5 font-mono text-sm uppercase tracking-[0.18em] text-[#00f0ff]">Quantum Risk Topology</h2>
        <RiskGraph graph={graph} />
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="aether-panel p-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl text-slate-100">{value}</p>
    </div>
  );
}
