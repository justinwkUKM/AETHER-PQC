import { FileCheck2, History, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/shell";
import { EvidenceWorkbench } from "@/components/project/evidence-workbench";
import { buildEvidenceReport } from "@/lib/evidence-report";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);
  const report = buildEvidenceReport(project);

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
            <p className="text-xs font-medium text-[var(--accent-cyan)]">Compliance evidence</p>
            <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50">{project.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Review the audit trail behind this assessment: artifacts, parser modes, scan events, methodology, remediation records, and exportable evidence.
            </p>
          </div>
          <div className="grid gap-3">
            <QuickStat label="Coverage" value={`${report.summary.evidenceCoverage}%`} icon={<ShieldCheck className="h-4 w-4" />} />
            <QuickStat label="Events" value={report.summary.scanEventCount.toString()} icon={<History className="h-4 w-4" />} />
            <QuickStat label="Critical" value={report.summary.criticalRemediationCount.toString()} icon={<FileCheck2 className="h-4 w-4" />} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <EvidenceWorkbench report={report} />
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
