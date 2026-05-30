import Link from "next/link";
import { LogOut, Plus, ShieldCheck } from "lucide-react";
import { signOut } from "@/server/auth";
import { WorkspaceRail } from "@/components/workspace-rail";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string | null;
  projectId?: string;
  projectName?: string;
  projectRisk?: number;
  artifactCount?: number;
  remediationCount?: number;
  lastScanLabel?: string;
};

export function AppShell({
  children,
  userName,
  projectId,
  projectName,
  projectRisk,
  artifactCount,
  remediationCount,
  lastScanLabel
}: AppShellProps) {
  return (
    <div className="aether-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050916]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#32e6ff]/35 bg-[#08111f] shadow-[0_0_0_1px_rgba(50,230,255,0.04)]">
              <span className="font-mono text-xs tracking-[0.28em] text-[#32e6ff]">AX</span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#32e6ff]">AETHER-PQC</p>
              <p className="text-sm text-slate-300 transition-colors group-hover:text-slate-100">Post-quantum risk workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-xs text-slate-400 lg:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{userName ?? "Secure Session"}</span>
            </div>
            <Link href="/project/new" className="aether-button aether-button-primary px-4 py-2.5 text-sm font-medium">
              <Plus className="h-4 w-4" /> New assessment
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="aether-button aether-button-secondary h-11 w-11" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <WorkspaceRail
          userName={userName}
          projectId={projectId}
          projectName={projectName}
          projectRisk={projectRisk}
          artifactCount={artifactCount}
          remediationCount={remediationCount}
          lastScanLabel={lastScanLabel}
        />
        <section className="min-w-0">{children}</section>
      </main>
    </div>
  );
}
