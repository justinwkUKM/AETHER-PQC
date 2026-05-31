import { Globe2, Network, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/shell";
import { PlatformExposureWorkbench } from "@/components/project/platform-exposure-workbench";
import { enrichGraphExposure } from "@/lib/exposure";
import { parseGraphSnapshot } from "@/lib/graph";
import { buildPlatformExposureSummary } from "@/lib/platform-exposure";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function PlatformExposurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);
  const graph = enrichGraphExposure(parseGraphSnapshot(project.graphSnapshot));
  const summary = buildPlatformExposureSummary(graph);

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
            <p className="text-xs font-medium text-[var(--accent-cyan)]">Platform exposure</p>
            <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50">{project.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Focus on internet-facing, partner-facing, TLS, gateway, endpoint, and exposed crypto findings that platform teams can validate or remediate.
            </p>
          </div>
          <div className="grid gap-3">
            <QuickStat label="Edge critical" value={summary.networkFacingCritical.toString()} icon={<ShieldAlert className="h-4 w-4" />} />
            <QuickStat label="TLS / protocol" value={summary.tlsOrProtocolFindings.toString()} icon={<Network className="h-4 w-4" />} />
            <QuickStat label="Avg exposure" value={summary.averageExposure.toFixed(1)} icon={<Globe2 className="h-4 w-4" />} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <PlatformExposureWorkbench summary={summary} />
      </div>
    </AppShell>
  );
}

function QuickStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-4">
      <div className="flex items-center justify-between text-slate-500">
        <p className="text-xs font-medium">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-mono text-xl text-slate-50">{value}</p>
    </div>
  );
}
