import { AppShell } from "@/components/shell";
import { ArtifactUpload } from "@/components/project/artifact-upload";
import { ArtifactList } from "@/components/project/artifact-list";
import { LiveScanConsole } from "@/components/project/live-scan-console";
import { serializeScanEvent } from "@/lib/scan-events";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="aether-panel aether-fade-up rounded-lg overflow-hidden">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_minmax(280px,0.85fr)] lg:p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#05ffd1]">Scan workspace</p>
                <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50">{project.name}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                  Upload evidence, let deterministic parsing handle the clean cases, and hand the rest to Gemini multimodal analysis.
                </p>
              </div>
              <div className="grid gap-3">
                <Summary label="Artifacts" value={project.artifacts.length.toString()} />
                <Summary label="Latest scan" value={project.lastScanAt ? "Completed" : "Pending"} />
                <Summary label="Remediations" value={project.remediations.length.toString()} />
              </div>
            </div>
          </section>

          <ArtifactUpload projectId={project.id} />

          <ArtifactList artifacts={project.artifacts} projectId={project.id} />
        </div>

        <LiveScanConsole projectId={project.id} initialEvents={project.scanEvents.map(serializeScanEvent)} />
      </div>
    </AppShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-xl text-slate-50">{value}</p>
    </div>
  );
}
