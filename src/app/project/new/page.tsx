import { Atom, Plus } from "lucide-react";
import { AppShell } from "@/components/shell";
import { createProject } from "@/server/actions/projects";
import { requireUser } from "@/server/auth/guards";

export default async function NewProjectPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="aether-panel aether-fade-up rounded-lg p-6 lg:p-8">
          <p className="text-xs font-medium text-[var(--accent-cyan)]">New assessment</p>
          <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50">Create a focused assessment space.</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            Create a clean assessment space for one system, one migration track, and one source of truth for all future artifact scans.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Tip title="Project name" body="Use a stable, recognizable identifier for the system or migration workstream." />
            <Tip title="Context" body="Capture the business domain, scope, and the team that owns the assessment." />
            <Tip title="Artifacts" body="Drop SBOMs, PDFs, diagrams, screenshots, and supporting notes into the scan flow." />
            <Tip title="Remediation" body="Every high-risk primitive becomes a prioritized migration plan with evidence." />
          </div>
        </section>

        <form action={createProject} className="aether-panel aether-fade-up rounded-lg overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#91a7ff]/25 bg-[#08111f]">
                  <Atom className="h-5 w-5 text-[var(--accent-cyan)]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--accent-cyan)]">Assessment</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-50">Project details</h2>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Draft
              </span>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-500">Project name</span>
              <input name="name" required placeholder="core_payment_ledger" className="aether-input px-4 py-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-500">Assessment context</span>
              <textarea
                name="description"
                rows={6}
                placeholder="Business domain, known systems, scan objective"
                className="aether-input px-4 py-3 text-sm"
              />
            </label>
            <button className="aether-button aether-button-primary w-full px-4 py-4 text-sm font-medium">
              <Plus className="h-4 w-4" /> Create assessment
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}
