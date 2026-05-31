"use client";

import React, { useState, useTransition } from "react";
import { deleteArtifact, deleteArtifacts } from "@/server/actions/artifacts";
import { Eye, Trash2, FileText, Code, CheckCircle, AlertCircle, RefreshCw, X, Copy, Check, CheckSquare, Square } from "lucide-react";

type Artifact = {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  parseStatus: string;
  parserMode: string | null;
  parseError: string | null;
  rawPayload: string | null;
  aiModel: string | null;
  confidence: number | null;
  createdAt: Date;
};

type ArtifactListProps = {
  artifacts: Artifact[];
  projectId: string;
};

export function ArtifactList({ artifacts, projectId }: ArtifactListProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Copy payload to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle individual selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Toggle all items selection
  const allSelected = artifacts.length > 0 && selectedIds.size === artifacts.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(artifacts.map((a) => a.id)));
    }
  };

  // Handle single deletion
  const handleDelete = (artifactId: string) => {
    if (!confirm("Are you sure you want to delete this artifact? The threat graph and risk score will be updated dynamically.")) {
      return;
    }
    setDeletingId(artifactId);
    startTransition(async () => {
      try {
        await deleteArtifact(projectId, artifactId);
        if (selectedArtifact?.id === artifactId) {
          setSelectedArtifact(null);
        }
        const next = new Set(selectedIds);
        next.delete(artifactId);
        setSelectedIds(next);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete artifact.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.size} selected artifacts? The threat graph and risk score will be updated dynamically.`)) {
      return;
    }
    startTransition(async () => {
      try {
        const ids = Array.from(selectedIds);
        await deleteArtifacts(projectId, ids);
        if (selectedArtifact && ids.includes(selectedArtifact.id)) {
          setSelectedArtifact(null);
        }
        setSelectedIds(new Set());
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to bulk delete artifacts.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Artifact Table / List */}
      <section className="aether-panel rounded-lg p-5 lg:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            {artifacts.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center justify-center text-slate-400 hover:text-slate-200 focus:outline-none"
                title={allSelected ? "Deselect All" : "Select All"}
              >
                {allSelected ? <CheckSquare className="h-5 w-5 text-[#32e6ff]" /> : <Square className="h-5 w-5" />}
              </button>
            )}
            <div>
              <h2 className="aether-title text-xl font-semibold text-slate-50">Ingested Artifacts</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">All uploaded source materials, specifications, and parsed states.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            )}
            <span className="rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-xs text-slate-400">
              {artifacts.length} total
            </span>
          </div>
        </div>

        {artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No artifacts have been uploaded to this project yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {artifacts.map((artifact) => {
              const isDeleting = deletingId === artifact.id;
              const isSelected = selectedArtifact?.id === artifact.id;
              const isChecked = selectedIds.has(artifact.id);

              return (
                <div
                  key={artifact.id}
                  className={`grid gap-4 items-center rounded-lg border p-4 text-sm md:grid-cols-[auto_1.5fr_0.8fr_0.8fr_0.8fr_1fr] transition-all duration-200 ${
                    isSelected
                      ? "border-[#32e6ff]/45 bg-[#0b172a]"
                      : "border-white/10 bg-[#08111f] hover:border-white/20 hover:bg-[#0b1424]"
                  }`}
                >
                  {/* Select Checkbox */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => toggleSelect(artifact.id)}
                      className="text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {isChecked ? <CheckSquare className="h-4.5 w-4.5 text-[#32e6ff]" /> : <Square className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  {/* File Name & Icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white/3 border border-white/10 text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-200" title={artifact.name}>
                        {artifact.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{formatBytes(artifact.sizeBytes)}</p>
                    </div>
                  </div>

                  {/* Parse Status Badge */}
                  <div>
                    {artifact.parseStatus === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs text-emerald-400">
                        <CheckCircle className="h-3 w-3" /> Completed
                      </span>
                    ) : artifact.parseStatus === "FAILED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 text-xs text-rose-400">
                        <AlertCircle className="h-3 w-3" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-xs text-blue-400">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Processing
                      </span>
                    )}
                  </div>

                  {/* Parser Mode */}
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                      {artifact.parserMode ?? "PENDING"}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-slate-500 text-xs">
                    {new Date(artifact.createdAt).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedArtifact(isSelected ? null : artifact)}
                      className="flex items-center gap-1.5 rounded border border-white/10 bg-white/3 hover:bg-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition-colors"
                      title="Inspect extracted payload"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => handleDelete(artifact.id)}
                      disabled={isDeleting || isPending}
                      className="flex items-center justify-center h-8.5 w-8.5 rounded border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 transition-colors disabled:opacity-50"
                      title="Delete artifact & entities"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Drawer / Inspection Panel */}
      {selectedArtifact && (
        <section className="aether-panel rounded-lg border border-[#32e6ff]/20 bg-[#060b15] overflow-hidden aether-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#0a101f]">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-[#32e6ff]" />
              <div>
                <h3 className="font-semibold text-slate-100">Artifact Inspector</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedArtifact.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedArtifact(null)}
              className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-2 gap-4 border-b border-white/5 bg-[#080d19]/40 p-4 text-xs font-mono md:grid-cols-4">
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px]">Parser Model</p>
              <p className="mt-1 text-slate-300">{selectedArtifact.aiModel || "Deterministic Parser"}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px]">Confidence Level</p>
              <p className="mt-1 text-[#32e6ff]">
                {selectedArtifact.confidence !== null ? `${(selectedArtifact.confidence * 100).toFixed(1)}%` : "100.0%"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px]">Mime Type</p>
              <p className="mt-1 text-slate-300">{selectedArtifact.mimeType}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px]">Date Uploaded</p>
              <p className="mt-1 text-slate-300">{new Date(selectedArtifact.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Content Block */}
          <div className="p-5">
            {selectedArtifact.parseStatus === "FAILED" ? (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-rose-200">Extraction Failure Log</h4>
                    <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 font-mono text-xs text-rose-300 border border-rose-900/30 leading-5">
                      {selectedArtifact.parseError || "No detailed log available."}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold font-mono">
                    Extracted Text Payload
                  </span>
                  <button
                    onClick={() => handleCopy(selectedArtifact.rawPayload || "")}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-white/3 hover:bg-white/8 px-2.5 py-1.5 text-xs text-slate-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                  <pre className="max-h-96 overflow-y-auto p-4 font-mono text-xs text-slate-300 leading-6 whitespace-pre-wrap break-all">
                    {selectedArtifact.rawPayload || "Empty payload extracted."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
