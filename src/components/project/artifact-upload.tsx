"use client";

import { useRef, useState, useTransition } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { uploadArtifact } from "@/server/actions/artifacts";

export function ArtifactUpload({ projectId }: { projectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setMessage("Uploading and scanning artifact...");
        startTransition(async () => {
          await uploadArtifact(projectId, formData);
          setMessage("Scan request completed.");
          formRef.current?.reset();
        });
      }}
      className="aether-panel overflow-hidden rounded-lg"
    >
      <div className="border-b border-white/10 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Artifact intake</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-50">Drop evidence or choose a file</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Structured uploads are parsed locally first. Visual and ambiguous uploads go through Gemini multimodal extraction.</p>
      </div>

      <div className="space-y-5 p-5">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-[#08111f] px-6 py-10 text-center transition-colors hover:border-[#32e6ff]/40 hover:bg-[#0b1324]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#32e6ff]/20 bg-white/3">
            <UploadCloud className="h-6 w-6 text-[#32e6ff]" />
          </div>
          <span className="mt-4 text-sm text-slate-200">Drop or select SBOM, CBOM, PDF, image, CSV, text, or Markdown</span>
          <span className="mt-2 text-xs text-slate-500">Maximum file size 25MB</span>
          <input name="artifact" type="file" required className="mt-5 text-xs text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-slate-100 file:transition hover:file:bg-white/15" />
        </label>

        <div className="flex flex-wrap gap-2">
          {["Deterministic parse", "Gemini multimodal", "Graph merge", "Remediation update"].map((item) => (
            <span key={item} className="aether-chip rounded-full px-3 py-2 text-xs text-slate-300">
              {item}
            </span>
          ))}
        </div>

        <button disabled={isPending} className="aether-button aether-button-primary w-full px-4 py-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50">
          <FileUp className="h-4 w-4" />
          {isPending ? "Processing" : "Execute artifact scan"}
        </button>

        {message ? (
          <p className="rounded-md border border-white/10 bg-white/3 px-4 py-3 text-sm text-slate-300" aria-live="polite">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
