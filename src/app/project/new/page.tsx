import { Cpu, Terminal } from "lucide-react";
import { AppShell } from "@/components/shell";
import { createProject } from "@/server/actions/projects";
import { requireUser } from "@/server/auth/guards";

export default async function NewProjectPage() {
  const user = await requireUser();

  return (
    <AppShell userName={user.name}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between border border-[#1f2d44] bg-[#0b0f19] p-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-[#00f0ff]" />
            <h1 className="font-mono text-sm font-bold tracking-[0.18em] text-[#00f0ff]">PROTOCOL // SYSTEM_PROVISION</h1>
          </div>
          <span className="text-[10px] text-slate-500">SYS_REV // 1.0.0</span>
        </div>
        <form action={createProject} className="aether-panel space-y-5 p-6">
          <label className="block">
            <span className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Project Identifier Token</span>
            <input name="name" required placeholder="core_payment_ledger" className="aether-input px-3 py-3 text-sm" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Operational Context</span>
            <textarea name="description" rows={4} placeholder="Business domain, known systems, scan objective" className="aether-input px-3 py-3 text-sm" />
          </label>
          <button className="inline-flex w-full items-center justify-center gap-2 border border-[#00f0ff] px-4 py-3 font-mono text-xs font-bold tracking-[0.18em] text-[#00f0ff] hover:bg-[#00f0ff]/10">
            <Cpu className="h-4 w-4" /> EXECUTE INTEL_SCAN PROTOCOL
          </button>
        </form>
      </div>
    </AppShell>
  );
}
