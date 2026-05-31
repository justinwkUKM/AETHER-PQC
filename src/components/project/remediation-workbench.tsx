"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, FileText, Filter, HelpCircle, ShieldAlert, Wrench } from "lucide-react";
import {
  evidenceNames,
  openQuestions,
  remediationCategory,
  ticketMarkdown,
  validationSteps,
  whyPrioritized,
  type ArtifactSummary,
  type RemediationCategory,
  type WorkbenchRemediation
} from "@/lib/remediation-workbench";

const priorityColor = {
  CRITICAL: "border-rose-500/30 text-rose-200",
  HIGH: "border-amber-500/30 text-amber-200",
  MEDIUM: "border-cyan-500/30 text-cyan-200",
  LOW: "border-emerald-500/30 text-emerald-200"
};

const categories: Array<"All" | RemediationCategory> = [
  "All",
  "Application action",
  "Platform action",
  "Vendor action",
  "Architecture review"
];

const priorities = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export function RemediationWorkbench({ remediations, artifacts }: { remediations: WorkbenchRemediation[]; artifacts: ArtifactSummary[] }) {
  const [categoryFilter, setCategoryFilter] = useState<(typeof categories)[number]>("All");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorities)[number]>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categorized = useMemo(
    () => remediations.map((remediation) => ({ remediation, category: remediationCategory(remediation) })),
    [remediations]
  );

  const filtered = categorized.filter(({ remediation, category }) => {
    const categoryMatch = categoryFilter === "All" || categoryFilter === category;
    const priorityMatch = priorityFilter === "All" || priorityFilter === remediation.priority;
    return categoryMatch && priorityMatch;
  });

  if (remediations.length === 0) {
    return (
      <div className="aether-card rounded-lg p-8 text-sm leading-7 text-slate-400">
        No remediations generated yet. Upload an artifact to trigger the first plan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aether-card rounded-lg p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-300">
          <Filter className="h-4 w-4 text-[#91a7ff]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.24em]">Workbench filters</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <FilterGroup
            label="Category"
            options={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          <FilterGroup
            label="Priority"
            options={priorities}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/3 p-8 text-center text-sm text-slate-400">
          No remediations match the current filters.
        </div>
      ) : (
        filtered.map(({ remediation, category }) => {
          const evidence = evidenceNames(remediation, artifacts);
          const questions = openQuestions(remediation);
          const validation = validationSteps(remediation);
          const copied = copiedId === remediation.id;

          return (
            <article key={remediation.id} className={`rounded-lg border bg-[#08111f] p-5 ${priorityColor[remediation.priority]}`}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Target node</p>
                  <h2 className="mt-2 text-base font-semibold text-slate-50">{remediation.targetNode}</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-[10px]">{category}</span>
                    <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-[10px]">
                      {(remediation.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-xs">{remediation.priority}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(ticketMarkdown(remediation, artifacts));
                      setCopiedId(remediation.id);
                      setTimeout(() => setCopiedId(null), 1800);
                    }}
                    className="aether-button aether-button-secondary px-3 py-1.5 text-xs"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy ticket"}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <WorkbenchSection icon={<ShieldAlert className="h-4 w-4" />} title="Why this is prioritized">
                  {whyPrioritized(remediation)}
                </WorkbenchSection>
                <WorkbenchSection icon={<Wrench className="h-4 w-4" />} title="What to change">
                  {remediation.recommendedMigration ?? "Review the affected cryptographic posture and define the migration target."}
                </WorkbenchSection>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-md border border-white/10 bg-[#050a14] p-4">
                  <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    <Check className="h-3.5 w-3.5 text-[#91a7ff]" />
                    How to validate
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-slate-400">
                    {validation.map((step) => (
                      <li key={step} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#91a7ff]" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-white/10 bg-[#050a14] p-4">
                  <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    <HelpCircle className="h-3.5 w-3.5 text-[#91a7ff]" />
                    Open questions
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-slate-400">
                    {questions.map((question) => (
                      <li key={question} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-4">
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <FileText className="h-3.5 w-3.5 text-[#91a7ff]" />
                  Evidence and primitive
                </p>
                <div className="grid gap-3 text-sm leading-6 text-slate-400 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <span className="text-slate-300">Vulnerable primitive: </span>
                    {remediation.vulnerablePrimitive ?? "Not specified"}
                  </div>
                  <div>
                    <span className="text-slate-300">Source evidence: </span>
                    {evidence.length > 0 ? evidence.join(", ") : "No source artifact attached"}
                  </div>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function WorkbenchSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
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
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
