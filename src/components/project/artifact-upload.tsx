"use client";

import React, { useRef, useState, useTransition } from "react";
import { FileUp, UploadCloud, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";
import { analyzeProjectBatch, uploadArtifact } from "@/server/actions/artifacts";

type FileQueueItem = {
  name: string;
  size: number;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  error?: string;
};

type OverallStatus = {
  message: string;
  state: "IDLE" | "RUNNING" | "SUCCESS" | "WARNING" | "ERROR";
};

export function ArtifactUpload({ projectId }: { projectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [overallStatus, setOverallStatus] = useState<OverallStatus>({ message: "", state: "IDLE" });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const items = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        status: "QUEUED" as const
      }));
      setQueue(items);
      setOverallStatus({ message: "", state: "IDLE" });
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current?.files || inputRef.current.files.length === 0) {
      alert("Please select at least one artifact file.");
      return;
    }

    const files = Array.from(inputRef.current.files);

    // Initialize state queue to queued
    setQueue(
      files.map((file) => ({
        name: file.name,
        size: file.size,
        status: "QUEUED"
      }))
    );

    startTransition(async () => {
      const completedArtifactIds: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "PROCESSING" } : item))
        );
        setOverallStatus({ message: `Processing file ${i + 1} of ${files.length}: ${file.name}`, state: "RUNNING" });

        try {
          const singleFormData = new FormData();
          singleFormData.append("artifact", file);

          const result = await uploadArtifact(projectId, singleFormData);

          if (result.status === "FAILED") {
            setQueue((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, status: "FAILED", error: result.error } : item
              )
            );
            continue;
          }

          completedArtifactIds.push(result.artifactId);
          setQueue((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: "COMPLETED" } : item))
          );
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Upload processing failed.";
          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "FAILED", error: errMsg } : item
            )
          );
        }
      }

      if (completedArtifactIds.length > 1) {
        setOverallStatus({ message: `Running unified batch analysis across ${completedArtifactIds.length} artifacts...`, state: "RUNNING" });
        const batchResult = await analyzeProjectBatch(projectId, completedArtifactIds);
        setOverallStatus({
          message: batchResult.message,
          state: batchResult.status === "COMPLETED" ? "SUCCESS" : batchResult.status === "SKIPPED" ? "WARNING" : "ERROR"
        });
      } else {
        setOverallStatus({ message: "Artifact scanning completed.", state: "SUCCESS" });
      }

      if (formRef.current) formRef.current.reset();
    });
  };

  return (
    <form ref={formRef} onSubmit={handleUploadSubmit} className="aether-panel overflow-hidden rounded-lg">
      <div className="border-b border-white/10 px-5 py-4 bg-[#0a101f]">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Artifact Intake Queue</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-50">Bulk Ingestion Portal</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Select multiple files (SBOMs, system diagrams, specs). Files are parsed sequentially, then completed artifacts are analyzed together in one cross-file pass.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* Large Drag-and-Drop Area */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-[#08111f] px-6 py-10 text-center transition-colors hover:border-[#32e6ff]/40 hover:bg-[#0b1324]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#32e6ff]/20 bg-white/3">
            <UploadCloud className="h-6 w-6 text-[#32e6ff]" />
          </div>
          <span className="mt-4 text-sm text-slate-200">
            Click to choose SBOM, CBOM, PDF, image, CSV, text, or Markdown
          </span>
          <span className="mt-2 text-xs text-slate-500">Supports multiple selection | Max size 25MB per file</span>

          <input
            ref={inputRef}
            name="artifact"
            type="file"
            multiple
            required
            onChange={handleFileChange}
            disabled={isPending}
            className="mt-5 text-xs text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-slate-100 file:transition hover:file:bg-white/15 disabled:opacity-50"
          />
        </label>

        {/* Dynamic Queue Stack */}
        {queue.length > 0 && (
          <div className="space-y-2 border border-white/5 bg-[#050a14] rounded-lg p-4 max-h-60 overflow-y-auto">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mb-2">Ingestion Queue ({queue.length} items)</p>
            {queue.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 mr-3">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-slate-200 font-medium" title={item.name}>{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatBytes(item.size)}</p>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-[10px]">
                  {item.status === "QUEUED" && (
                    <span className="text-slate-500 uppercase">Queued</span>
                  )}
                  {item.status === "PROCESSING" && (
                    <span className="flex items-center gap-1 text-[#32e6ff] uppercase">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processing
                    </span>
                  )}
                  {item.status === "COMPLETED" && (
                    <span className="flex items-center gap-1 text-emerald-400 uppercase">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Success
                    </span>
                  )}
                  {item.status === "FAILED" && (
                    <span
                      className="flex items-center gap-1 text-rose-400 uppercase cursor-help"
                      title={item.error}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Fail
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Upload Button */}
        <button
          disabled={isPending || queue.length === 0}
          className="aether-button aether-button-primary w-full px-4 py-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileUp className="h-4 w-4" />
          {isPending ? "Ingesting Sequence..." : "Execute Sequential Scan"}
        </button>

        {/* Global Progress Indicator */}
        {overallStatus.message && (
          <div
            className={`rounded-md border px-4 py-3 text-xs font-mono flex items-center gap-2 ${
              overallStatus.state === "SUCCESS"
                ? "border-emerald-400/25 bg-emerald-400/8 text-emerald-300"
                : overallStatus.state === "WARNING"
                  ? "border-amber-400/25 bg-amber-400/8 text-amber-300"
                  : overallStatus.state === "ERROR"
                    ? "border-rose-400/25 bg-rose-400/8 text-rose-300"
                    : "border-[#32e6ff]/20 bg-[#32e6ff]/5 text-[#32e6ff]"
            }`}
          >
            {overallStatus.state === "RUNNING" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {overallStatus.state === "SUCCESS" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {overallStatus.state === "WARNING" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {overallStatus.state === "ERROR" ? <XCircle className="h-3.5 w-3.5" /> : null}
            <span>{overallStatus.message}</span>
          </div>
        )}
      </div>
    </form>
  );
}
