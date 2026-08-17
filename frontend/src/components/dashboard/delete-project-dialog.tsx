// Delete Project confirmation modal, opened from a card's "..." menu. Asks the
// user to confirm, then calls the backend delete endpoint. Controlled by the
// parent (open/onClose); Cancel/Esc/backdrop dismiss without changes.
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Project } from "@/data/dashboard-data";
import { deleteProject } from "@/store/projectsSlice";
import { useAppDispatch } from "@/store/hooks";

// Inner modal content. Mounted only while `open`, so its state starts fresh each open.
function DeleteProjectModalContent({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleDelete() {
    setError(null);
    try {
      await dispatch(deleteProject(project.id)).unwrap();
      onClose();
    } catch {
      setError("Something went wrong deleting your project.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-md border border-border bg-card shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="delete-project-title"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Delete Project
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4 cursor-pointer" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{project.name}</span>?
            This action cannot be undone.
          </p>
        </div>

        {error ? (
          <p className="px-5 pb-1 text-sm text-danger">{error}</p>
        ) : null}

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-sm cursor-pointer bg-danger px-4 py-2.5 text-sm font-medium text-danger-foreground transition-colors hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Controlled wrapper: renders the modal only while `open`.
export function DeleteProjectDialog({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return createPortal(
    <DeleteProjectModalContent project={project} onClose={onClose} />,
    document.body,
  );
}
