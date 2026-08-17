// "New Project" trigger + Create Project modal. Self-contained so it can be
// opened from both the dashboard greeting header and the projects page without
// shared state. Submission calls the backend create endpoint; startFrom/template/
// AI are UI-only scaffolds the backend doesn't persist yet.
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { templates, type ProjectVisibility } from "@/data/dashboard-data";
import {
  ProjectFormFields,
  type StartFrom,
} from "@/components/dashboard/project-form-fields";
import { createProject } from "@/store/projectsSlice";
import { useAppDispatch } from "@/store/hooks";

// Renders the "New Project" button and, when open, the creation modal.
export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");
  const [startFrom, setStartFrom] = useState<StartFrom>("empty");
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [systemDescription, setSystemDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  // Close on Escape, lock body scroll, and focus the name field while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function resetForm() {
    setName("");
    setDescription("");
    setVisibility("private");
    setStartFrom("empty");
    setSystemDescription("");
    setTemplateId(templates[0]?.id ?? "");
    setError(null);
  }

  // Creates the project via the backend, then closes. The backend only persists
  // name/description/visibility; startFrom/template/AI are UI-only for now.
  async function handleCreate() {
    if (!name.trim()) return;
    setError(null);
    try {
      await dispatch(
        createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          visibility: visibility.toUpperCase() as "PRIVATE" | "PUBLIC" | "UNLISTED",
        }),
      ).unwrap();
      setOpen(false);
      resetForm();
    } catch {
      setError("Something went wrong creating your project.");
    }
  }

  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="flex max-h-[90vh] w-full max-w-md flex-col rounded-md border border-border bg-card shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2
                id="create-project-title"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                Create New Project
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4 cursor-pointer" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
              <ProjectFormFields
                idPrefix="new"
                name={name}
                onNameChange={setName}
                description={description}
                onDescriptionChange={setDescription}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                showStartFrom
                nameRef={nameRef}
                startFrom={startFrom}
                onStartFromChange={setStartFrom}
                templates={templates}
                templateId={templateId}
                onTemplateIdChange={setTemplateId}
                systemDescription={systemDescription}
                onSystemDescriptionChange={setSystemDescription}
                onGenerate={() => {}}
              />
            </div>

            {error ? (
              <p className="px-5 pb-1 text-sm text-danger">{error}</p>
            ) : null}

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!name.trim()}
                className="rounded-sm cursor-pointer bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center cursor-pointer gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        New Project
      </button>
      {modal}
    </>
  );
}
