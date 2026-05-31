import Link from "next/link";
import { ArrowRight, DatabaseZap, FolderKanban, ScanSearch, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/shell";
import { RiskGraph } from "@/components/graph/risk-graph";
import { DeleteProjectButton } from "@/components/project/delete-project-button";
import { parseGraphSnapshot } from "@/lib/graph";
import { enrichGraphExposure } from "@/lib/exposure";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);
  const graph = enrichGraphExposure(parseGraphSnapshot(project.graphSnapshot));
  const highestExposure = graph.nodes.reduce((max, node) => Math.max(max, node.exposureScore), 0);
  const networkCritical = graph.nodes.filter((node) => (node.effectiveRiskScore || node.vulnerabilityScore) >= 8.5 && node.exposureLevel === "INTERNET_EDGE").length;
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
      <div className="space-y-6">
        <section className="aether-panel aether-fade-up rounded-lg overflow-hidden">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_minmax(300px,0.85fr)] lg:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#05ffd1]">Project core</p>
              <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50 lg:text-5xl">{project.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{project.description ?? "No description provided."}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/project/${project.id}/scan`} className="aether-button aether-button-primary px-4 py-3 text-sm font-medium">
                  Open scan <ScanSearch className="h-4 w-4" />
                </Link>
                <Link href={`/project/${project.id}/remediations`} className="aether-button aether-button-secondary px-4 py-3 text-sm">
                  Review remediation plan <ArrowRight className="h-4 w-4" />
                </Link>
                <DeleteProjectButton projectId={project.id} />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg border border-white/10 bg-[#08111f] p-4">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] uppercase tracking-[0.24em]">Risk score</span>
                  <DatabaseZap className="h-4 w-4 text-[#05ffd1]" />
                </div>
                <p className="mt-3 font-mono text-4xl text-slate-50">{project.riskScore.toFixed(1)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Exposure-aware risk blends crypto weakness with network reachability.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Stat label="Max exposure" value={highestExposure.toFixed(1)} icon={<FolderKanban className="h-4 w-4" />} />
                <Stat label="Edge critical" value={networkCritical.toString()} icon={<ShieldCheck className="h-4 w-4" />} />
                <Stat label="Nodes" value={graph.nodes.length.toString()} icon={<DatabaseZap className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </section>

        <section className="aether-panel rounded-lg p-5 lg:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="aether-title text-xl font-semibold text-slate-50">Quantum risk topology</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">The graph shows the current relationship map and crypto exposure.</p>
            </div>
          </div>
          <RiskGraph projectId={project.id} graph={graph} artifacts={project.artifacts.map((artifact) => ({ id: artifact.id, name: artifact.name, type: artifact.type, rawPayload: artifact.rawPayload }))} />
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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
