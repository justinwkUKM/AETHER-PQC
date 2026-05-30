"use client";

import { useRef, useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";
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
      className="aether-panel p-5"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#1f2d44] p-8 text-center hover:border-[#00f0ff]/60">
        <UploadCloud className="mb-3 h-8 w-8 text-[#00f0ff]" />
        <span className="text-sm text-slate-300">Drop or select SBOM, CBOM, PDF, image, CSV, text, or Markdown</span>
        <span className="mt-2 text-xs text-slate-600">MAX FILE LIMITATION: 25MB</span>
        <input name="artifact" type="file" required className="mt-5 text-xs text-slate-500" />
      </label>
      <button disabled={isPending} className="mt-4 w-full border border-[#00f0ff] px-4 py-3 font-mono text-xs text-[#00f0ff] hover:bg-[#00f0ff]/10 disabled:opacity-40">
        {isPending ? "PROCESSING" : "EXECUTE ARTIFACT SCAN"}
      </button>
      {message ? <p className="mt-3 text-xs text-slate-500">{message}</p> : null}
    </form>
  );
}
