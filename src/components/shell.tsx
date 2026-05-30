import Link from "next/link";
import { LogOut, Plus, ShieldCheck } from "lucide-react";
import { signOut } from "@/server/auth";

export function AppShell({ children, userName }: { children: React.ReactNode; userName?: string | null }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1f2d44] bg-[#050914]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="font-mono text-sm font-bold tracking-[0.24em] text-[#00f0ff]">
            {"// AETHER //"}
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">System Status: ACTIVE</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{userName ?? "Secure Session"}</span>
            <Link href="/project/new" className="inline-flex items-center gap-2 border border-[#00f0ff] px-3 py-2 font-mono text-[11px] text-[#00f0ff] hover:bg-[#00f0ff]/10">
              <Plus className="h-4 w-4" /> NEW
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="p-2 text-slate-500 hover:text-slate-100" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
