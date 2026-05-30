import { AppShell } from "@/components/shell";
import { ArtifactUpload } from "@/components/project/artifact-upload";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);

  return (
    <AppShell userName={user.name}>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Scan Terminal</p>
          <h1 className="mt-2 text-3xl font-semibold">{project.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Upload artifacts for deterministic and Gemini multimodal extraction.</p>
          <div className="mt-6">
            <ArtifactUpload projectId={project.id} />
          </div>
          <section className="aether-panel mt-6 p-5">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Artifacts</h2>
            <div className="space-y-2">
              {project.artifacts.map((artifact) => (
                <div key={artifact.id} className="grid gap-2 border border-[#1f2d44] bg-[#030712] p-3 text-xs md:grid-cols-4">
                  <span className="text-slate-200">{artifact.name}</span>
                  <span className="text-slate-500">{artifact.type}</span>
                  <span className="text-[#00f0ff]">{artifact.parseStatus}</span>
                  <span className="text-slate-500">{artifact.parserMode ?? "PENDING"}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="aether-panel h-[620px] overflow-y-auto p-4 font-mono text-xs">
          <h2 className="mb-4 border-b border-[#1f2d44] pb-3 uppercase tracking-[0.18em] text-[#00f0ff]">Console Core Activity Log</h2>
          <div className="space-y-2">
            {project.scanEvents.length === 0 ? <p className="text-slate-600">SYSTEM IDLE</p> : null}
            {project.scanEvents.map((event) => (
              <div key={event.id} className={event.level === "ERROR" ? "text-rose-400" : event.level === "SUCCESS" ? "text-emerald-400" : "text-slate-400"}>
                [{event.createdAt.toISOString().slice(11, 19)}] {event.message}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
