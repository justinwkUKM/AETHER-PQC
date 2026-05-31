"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, FileText, History, ShieldCheck } from "lucide-react";
import type { buildEvidenceReport } from "@/lib/evidence-report";

type EvidenceReport = ReturnType<typeof buildEvidenceReport>;

export function EvidenceWorkbench({ report }: { report: EvidenceReport }) {
  const [copied, setCopied] = useState(false);
  const evidenceJson = useMemo(() => JSON.stringify(report, null, 2), [report]);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Artifacts" value={report.summary.artifactCount.toString()} />
        <SummaryCard label="Remediations" value={report.summary.remediationCount.toString()} />
        <SummaryCard label="AI assisted" value={report.summary.aiAssistedArtifactCount.toString()} />
        <SummaryCard label="Evidence coverage" value={`${report.summary.evidenceCoverage}%`} />
      </section>

      <section className="aether-panel rounded-lg p-5 lg:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#91a7ff]">Exportable evidence package</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-50">Audit-ready assessment record</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Includes project scope, artifact lifecycle, parser modes, scan events, methodology, remediation status, confidence, and source references.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(evidenceJson);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="aether-button aether-button-primary px-4 py-3 text-sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? "Copied JSON" : "Copy evidence JSON"}
          </button>
        </div>
        <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-5 text-slate-400">
          {evidenceJson}
        </pre>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="aether-panel rounded-lg p-5 lg:p-6">
          <SectionHeader icon={<ShieldCheck className="h-4 w-4" />} title="Methodology" />
          <div className="space-y-3">
            {Object.entries(report.methodology).map(([key, value]) => (
              <div key={key} className="rounded-md border border-white/10 bg-[#08111f] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{key}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="aether-panel rounded-lg p-5 lg:p-6">
          <SectionHeader icon={<History className="h-4 w-4" />} title="Scan event timeline" />
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {report.scanEvents.length === 0 ? (
              <EmptyLine>No scan events recorded yet.</EmptyLine>
            ) : (
              report.scanEvents.map((event) => (
                <div key={event.id} className="rounded-md border border-white/10 bg-[#08111f] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[10px] text-slate-300">{event.level}</span>
                    <span className="font-mono text-[10px] text-slate-500">{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{event.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="aether-panel rounded-lg p-5 lg:p-6">
        <SectionHeader icon={<FileText className="h-4 w-4" />} title="Artifact audit trail" />
        <div className="grid gap-3">
          {report.artifacts.length === 0 ? (
            <EmptyLine>No artifacts uploaded yet.</EmptyLine>
          ) : (
            report.artifacts.map((artifact) => (
              <div key={artifact.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#08111f] p-4 lg:grid-cols-[1fr_0.8fr_0.8fr]">
                <div>
                  <p className="font-medium text-slate-100">{artifact.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{artifact.mimeType} · {formatBytes(artifact.sizeBytes)}</p>
                </div>
                <Detail label="Lifecycle" value={`${artifact.parseStatus} · ${artifact.parserMode}`} />
                <Detail label="AI / confidence" value={`${artifact.aiModel ?? "No AI model recorded"} · ${typeof artifact.confidence === "number" ? `${Math.round(artifact.confidence * 100)}%` : "n/a"}`} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 font-mono text-2xl text-slate-50">{value}</p>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[#91a7ff]">{icon}</span>
      <h2 className="aether-title text-lg font-semibold text-slate-50">{title}</h2>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-300">{value}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-white/10 bg-white/3 p-5 text-sm text-slate-400">{children}</div>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
