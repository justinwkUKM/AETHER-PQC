"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteProject } from "@/server/actions/projects";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [armed, setArmed] = useState(false);

  return (
    <form
      action={async () => {
        if (!armed) {
          setArmed(true);
          return;
        }
        await deleteProject(projectId);
      }}
    >
      <button
        type="submit"
        className="aether-button inline-flex items-center gap-2 border border-rose-500/35 bg-rose-500/8 px-4 py-2.5 font-mono text-xs text-rose-200 hover:bg-rose-500/14"
      >
        <Trash2 className="h-4 w-4" />
        {armed ? "CONFIRM DELETE" : "DELETE"}
      </button>
    </form>
  );
}
