// "Edit Project" modal — opened from a card's "•••" menu. Prefilled with the
// project's current values and, on submit, calls the backend update endpoint.
// Unlike the create modal it has no "Start from" section (visibility/name/desc
// only), per the update API. Controlled by the parent (open/onClose).
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Project, ProjectVisibility } from "@/data/dashboard-data";
import { ProjectFormFields } from "@/components/dashboard/project-form-fields";
import { updateProject } from "@/store/projectsSlice";
import { useAppDispatch } from "@/store/hooks";

// Inner modal content. Mounted only while `open`, so its state initializes from
// the current project on every open (no need to reset via an effect).
function EditProjectModalContent({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [visibility, setVisibility] = useState<ProjectVisibility>(
    project.visibility,
  );
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  // Close on Escape, lock body scroll, and focus the name field while open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleUpdate() {
    if (!name.trim()) return;
    setError(null);
    try {
      await dispatch(
        updateProject({
          id: project.id,
          input: {
            name: name.trim(),
            description: description.trim() || undefined,
            visibility: visibility.toUpperCase() as
              | "PRIVATE"
              | "PUBLIC"
              | "UNLISTED",
          },
        }),
      ).unwrap();
      onClose();
    } catch {
      setError("Something went wrong updating your project.");
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
        aria-labelledby="edit-project-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-md border border-border bg-card shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="edit-project-title"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Edit Project
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

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
          <ProjectFormFields
            idPrefix={`edit-${project.id}`}
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            showStartFrom={false}
            nameRef={nameRef}
          />
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
            onClick={handleUpdate}
            disabled={!name.trim()}
            className="rounded-sm cursor-pointer bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Update Project
          </button>
        </div>
      </div>
    </div>
  );
}

// Controlled wrapper: renders the modal only while `open`.
export function EditProjectDialog({
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
    <EditProjectModalContent project={project} onClose={onClose} />,
    document.body,
  );
}
