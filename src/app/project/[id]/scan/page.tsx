import { AppShell } from "@/components/shell";
import { ArtifactUpload } from "@/components/project/artifact-upload";
import { ArtifactList } from "@/components/project/artifact-list";
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
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Scan workspace</p>
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

        <aside className="aether-panel h-full overflow-hidden rounded-lg">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Console core</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-50">Activity log</h2>
          </div>
          <div className="max-h-[760px] space-y-3 overflow-y-auto p-5 font-mono text-xs">
            {project.scanEvents.length === 0 ? <p className="text-slate-500">System idle. Start by uploading the first artifact.</p> : null}
            {project.scanEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-md border px-3 py-3 ${
                  event.level === "ERROR"
                    ? "border-rose-500/20 bg-rose-500/8 text-rose-200"
                    : event.level === "SUCCESS"
                      ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-200"
                      : "border-white/10 bg-white/3 text-slate-300"
                }`}
              >
                <span className="mr-2 text-slate-500">[{event.createdAt.toISOString().slice(11, 19)}]</span>
                {event.message}
              </div>
            ))}
          </div>
        </aside>
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
