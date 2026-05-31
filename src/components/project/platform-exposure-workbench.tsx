"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Filter, Globe2, Network, Route, ShieldAlert } from "lucide-react";
import type { PlatformExposureFinding, PlatformExposureSummary } from "@/lib/platform-exposure";

const severities = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const categories = ["All", "Network edge", "TLS / protocol", "External service", "Exposed crypto", "Review"] as const;
const exposureLevels = ["All", "INTERNET_EDGE", "PARTNER", "INTERNAL", "UNKNOWN"] as const;

const severityStyles = {
  CRITICAL: "border-rose-500/30 bg-rose-500/8 text-rose-200",
  HIGH: "border-amber-500/30 bg-amber-500/8 text-amber-200",
  MEDIUM: "border-cyan-500/30 bg-cyan-500/8 text-cyan-200",
  LOW: "border-emerald-500/30 bg-emerald-500/8 text-emerald-200"
};

export function PlatformExposureWorkbench({ summary }: { summary: PlatformExposureSummary }) {
  const [severity, setSeverity] = useState<(typeof severities)[number]>("All");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [exposure, setExposure] = useState<(typeof exposureLevels)[number]>("All");

  const filtered = useMemo(
    () =>
      summary.findings.filter((finding) => {
        const severityMatch = severity === "All" || finding.severity === severity;
        const categoryMatch = category === "All" || finding.category === category;
        const exposureMatch = exposure === "All" || finding.exposureLevel === exposure;
        return severityMatch && categoryMatch && exposureMatch;
      }),
    [category, exposure, severity, summary.findings]
  );

  if (summary.findings.length === 0) {
    return (
      <div className="aether-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#05ffd1]/20 bg-[#05ffd1]/8">
          <Globe2 className="h-6 w-6 text-[#05ffd1]" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-100">No platform exposure detected yet</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Upload architecture diagrams, TLS inventories, endpoint lists, gateway notes, or cloud service documents to identify exposed crypto and protocol paths.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="aether-card rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <FilterGroup label="Severity" options={severities} value={severity} onChange={setSeverity} />
          <FilterGroup label="Category" options={categories} value={category} onChange={setCategory} />
          <FilterGroup label="Exposure" options={exposureLevels} value={exposure} onChange={setExposure} />
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/3 p-8 text-center text-sm text-slate-400">
          No exposure findings match the current filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((finding) => (
            <ExposureCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExposureCard({ finding }: { finding: PlatformExposureFinding }) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#08111f] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">{finding.category}</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-50">{finding.name}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={`rounded-full border px-3 py-1 font-mono text-[10px] ${severityStyles[finding.severity]}`}>{finding.severity}</span>
            <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-[10px] text-slate-400">{finding.exposureLevel.replaceAll("_", " ")}</span>
            {finding.protocolHints.map((hint) => (
              <span key={hint} className="rounded-full border border-[#05ffd1]/20 bg-[#05ffd1]/8 px-3 py-1 font-mono text-[10px] text-[#05ffd1]">{hint}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Score label="Risk" value={finding.effectiveRiskScore} />
          <Score label="Exposure" value={finding.exposureScore} />
          <Score label="Vuln" value={finding.vulnerabilityScore} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <Panel icon={<Route className="h-4 w-4" />} title="Exposure path">
          {finding.exposurePath}
        </Panel>
        <Panel icon={<ShieldAlert className="h-4 w-4" />} title="Platform action">
          {finding.action}
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <Panel icon={<Network className="h-4 w-4" />} title="Why it was flagged">
          {finding.reasons.join("; ")}
        </Panel>
        <Panel icon={<AlertTriangle className="h-4 w-4" />} title="Owner question">
          {finding.ownerQuestion}
        </Panel>
      </div>
    </article>
  );
}

function FilterGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
        <Filter className="h-3.5 w-3.5" />
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] transition ${
              option === value
                ? "border-[#05ffd1]/40 bg-[#05ffd1]/12 text-[#05ffd1]"
                : "border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            {option.replaceAll("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[74px] rounded-md border border-white/10 bg-[#050a14] px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-base text-slate-100">{value.toFixed(1)}</p>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-white/10 bg-[#050a14] p-4">
      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        <span className="text-[#05ffd1]">{icon}</span>
        {title}
      </p>
      <p className="text-sm leading-6 text-slate-400">{children}</p>
    </section>
  );
}
