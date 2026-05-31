"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Filter, KeyRound, Search, ShieldCheck } from "lucide-react";
import type { CryptoInventoryItem } from "@/lib/crypto-inventory";

const postureOptions = ["All", "Vulnerable", "Review", "Quantum-safe"] as const;
const exposureOptions = ["All", "INTERNET_EDGE", "PARTNER", "INTERNAL", "UNKNOWN"] as const;
const reviewOptions = ["All", "Ready for migration", "Needs review", "Monitor"] as const;

const postureStyles = {
  Vulnerable: "border-rose-500/30 bg-rose-500/8 text-rose-200",
  Review: "border-amber-500/30 bg-amber-500/8 text-amber-200",
  "Quantum-safe": "border-emerald-500/30 bg-emerald-500/8 text-emerald-200"
};

export function CryptoInventoryWorkbench({ items }: { items: CryptoInventoryItem[] }) {
  const [query, setQuery] = useState("");
  const [posture, setPosture] = useState<(typeof postureOptions)[number]>("All");
  const [exposure, setExposure] = useState<(typeof exposureOptions)[number]>("All");
  const [review, setReview] = useState<(typeof reviewOptions)[number]>("All");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const queryMatch = normalizedQuery.length === 0 || `${item.name} ${item.kind} ${item.migrationTarget} ${item.sourceArtifacts.map((artifact) => artifact.name).join(" ")}`.toLowerCase().includes(normalizedQuery);
      const postureMatch = posture === "All" || item.posture === posture;
      const exposureMatch = exposure === "All" || item.exposureLevel === exposure;
      const reviewMatch = review === "All" || item.reviewStatus === review;
      return queryMatch && postureMatch && exposureMatch && reviewMatch;
    });
  }, [exposure, items, posture, query, review]);

  const reviewCount = items.filter((item) => item.reviewStatus === "Needs review").length;

  if (items.length === 0) {
    return (
      <div className="aether-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#91a7ff]/20 bg-[#91a7ff]/8">
          <KeyRound className="h-6 w-6 text-[#91a7ff]" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-100">No crypto inventory yet</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Upload SBOMs, CBOMs, TLS notes, architecture diagrams, screenshots, or PDFs. AETHER will extract cryptographic primitives,
          protocols, parser evidence, confidence, and migration recommendations here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="aether-card rounded-lg p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#91a7ff]">Crypto inventory controls</p>
            <p className="mt-2 text-sm text-slate-400">
              {filtered.length} of {items.length} findings shown. {reviewCount} need review before migration planning.
            </p>
          </div>
          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search primitive, protocol, artifact"
              className="w-full rounded-md border border-white/10 bg-[#050a14] py-2 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#91a7ff]/40"
            />
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <FilterGroup label="Posture" options={postureOptions} value={posture} onChange={setPosture} />
          <FilterGroup label="Exposure" options={exposureOptions} value={exposure} onChange={setExposure} />
          <FilterGroup label="Review" options={reviewOptions} value={review} onChange={setReview} />
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/3 p-8 text-center text-sm text-slate-400">
          No crypto findings match the current filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-lg border border-white/10 bg-[#08111f] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">{item.kind}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-50">{item.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-full border px-3 py-1 font-mono text-[10px] ${postureStyles[item.posture]}`}>{item.posture}</span>
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-[10px] text-slate-400">{item.reviewStatus}</span>
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-[10px] text-slate-400">{item.exposureLevel.replaceAll("_", " ")}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Score label="Vuln" value={item.vulnerabilityScore} />
                  <Score label="Exposure" value={item.exposureScore} />
                  <Score label="Risk" value={item.effectiveRiskScore} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <InventorySection icon={<AlertTriangle className="h-4 w-4" />} title="Why it matters">
                  {item.rationale}
                </InventorySection>
                <InventorySection icon={<ShieldCheck className="h-4 w-4" />} title="Migration target">
                  {item.migrationTarget}
                </InventorySection>
              </div>

              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-400 lg:grid-cols-3">
                <Detail label="Confidence" value={`${(item.confidence * 100).toFixed(0)}%`} />
                <Detail label="Parser modes" value={item.parserModes.length ? item.parserModes.join(", ") : "UNKNOWN"} />
                <Detail label="Source evidence" value={item.sourceArtifacts.length ? item.sourceArtifacts.map((artifact) => artifact.name).join(", ") : "No artifact link"} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
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
                ? "border-[#91a7ff]/40 bg-[#91a7ff]/12 text-[#91a7ff]"
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
    <div className="min-w-[70px] rounded-md border border-white/10 bg-[#050a14] px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-base text-slate-100">{value.toFixed(1)}</p>
    </div>
  );
}

function InventorySection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-white/10 bg-[#050a14] p-4">
      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        <span className="text-[#91a7ff]">{icon}</span>
        {title}
      </p>
      <p className="text-sm leading-6 text-slate-400">{children}</p>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-slate-300">{value}</p>
    </div>
  );
}
