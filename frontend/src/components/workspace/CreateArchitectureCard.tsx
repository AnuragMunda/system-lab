// "Create New Architecture" card shown at the end of the ARCHITECTURES grid.
// Clicking it opens the New Architecture dialog (with Blank / Template / Duplicate / AI options).
"use client";

import { Plus } from "lucide-react";
import { NewArchitectureDialog } from "./NewArchitectureDialog";

// Renders the large dashed call-to-action card that launches architecture creation.
export function CreateArchitectureCard({
  projectId,
  onCreated,
}: {
  projectId: string;
  onCreated: () => void;
}) {
  return (
    <NewArchitectureDialog
      projectId={projectId}
      onCreated={onCreated}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="group flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-center transition-colors hover:border-border-strong hover:bg-card"
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors group-hover:border-primary/50">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Create New Architecture
          </span>
          <span className="max-w-[16rem] text-xs text-muted-foreground">
            Blank Architecture · From Template · Duplicate Existing · Generate with AI
          </span>
        </button>
      )}
    />
  );
}
