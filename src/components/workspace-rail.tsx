"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, KeyRound, LayoutDashboard, Plus, ScanSearch, ShieldCheck } from "lucide-react";

type WorkspaceRailProps = {
  userName?: string | null;
  projectId?: string;
  projectName?: string;
  projectRisk?: number;
  artifactCount?: number;
  remediationCount?: number;
  lastScanLabel?: string;
};

const baseNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/project/new", label: "New Assessment", icon: Plus }
];

export function WorkspaceRail({
  userName,
  projectId,
  projectName,
  projectRisk,
  artifactCount,
  remediationCount,
  lastScanLabel
}: WorkspaceRailProps) {
  const pathname = usePathname();
  const projectTabs = projectId
    ? [
        { href: `/project/${projectId}`, label: "Overview", icon: LayoutDashboard },
        { href: `/project/${projectId}/scan`, label: "Scan", icon: ScanSearch },
        { href: `/project/${projectId}/inventory`, label: "Inventory", icon: KeyRound },
        { href: `/project/${projectId}/remediations`, label: "Remediations", icon: ArrowRight }
      ]
    : [];

  return (
    <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div className="aether-panel flex h-full flex-col overflow-hidden">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#05ffd1]">AETHER-PQC</p>
              <h2 className="aether-title mt-2 text-lg font-semibold text-slate-50">Quantum risk workspace</h2>
            </div>
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {userName ?? "Secure session"} is reviewing post-quantum exposure and migration work.
          </p>
        </div>

        <div className="space-y-5 px-4 py-5">
          <nav className="grid gap-2">
            {baseNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`aether-button justify-start px-4 py-3 text-sm ${
                    active ? "aether-button-primary" : "aether-button-secondary text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {projectId ? (
            <section className="aether-card overflow-hidden rounded-lg">
              <div className="border-b border-white/10 px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#05ffd1]">My stuff</p>
                <h3 className="mt-2 text-base font-semibold text-slate-50">{projectName ?? "Untitled assessment"}</h3>
                <p className="mt-2 text-sm text-slate-400">Live status and navigation for the selected project.</p>
              </div>
              <div className="grid gap-3 px-4 py-4">
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/3 px-3 py-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk</span>
                  <span className="font-mono text-lg text-slate-50">{typeof projectRisk === "number" ? projectRisk.toFixed(1) : "0.0"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Artifacts" value={artifactCount ?? 0} />
                  <MiniStat label="Plans" value={remediationCount ?? 0} />
                </div>
                <div className="rounded-md border border-white/10 bg-[#08101f] px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Latest scan</p>
                  <p className="mt-2 text-sm text-slate-200">{lastScanLabel ?? "Awaiting the first artifact."}</p>
                </div>
              </div>
            </section>
          ) : null}

          {projectTabs.length > 0 ? (
            <section>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Project sections</p>
              <div className="grid gap-2">
                {projectTabs.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`aether-button justify-start px-4 py-3 text-sm ${
                        active ? "aether-button-primary" : "aether-button-secondary text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/3 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-base text-slate-100">{value}</p>
    </div>
  );
}
