// "New Project" trigger + Create Project modal. Self-contained so it can be
// opened from both the dashboard greeting header and the projects page without
// shared state. Submission is a UI scaffold (no persistence yet).
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { Plus, Sparkles, X } from "lucide-react";
import { AuthInput } from "@/components/auth/ui/auth-input";
import { templates } from "@/data/dashboard-data";

// Project visibility choices (mirror the backend enum).
type Visibility = "private" | "unlisted" | "public";
// How the project's first architecture is seeded.
type StartFrom = "empty" | "template" | "ai";

// Labelled textarea sharing the input styling used by AuthInput, reused for the
// project description and the AI system prompt.
function TextArea({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-sm border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
      />
    </div>
  );
}

// Renders the "New Project" button and, when open, the creation modal.
export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [startFrom, setStartFrom] = useState<StartFrom>("empty");
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [systemDescription, setSystemDescription] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

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
  }

  // Stub submit: name is required, then close. No persistence/API yet.
  function handleCreate() {
    if (!name.trim()) return;
    setOpen(false);
    resetForm();
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
              <AuthInput
                label="Project name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                ref={nameRef}
              />

              <TextArea
                label="Description"
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What are you building?"
              />

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-xs font-medium text-muted-foreground">
                  Visibility
                </legend>
                {(["private", "unlisted", "public"] as Visibility[]).map(
                  (value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 text-sm capitalize text-foreground"
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={value}
                        checked={visibility === value}
                        onChange={() => setVisibility(value)}
                        className="size-4 accent-primary"
                      />
                      {value}
                    </label>
                  ),
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-xs font-medium text-muted-foreground">
                  Start from
                </legend>
                {(
                  [
                    ["empty", "Empty architecture"],
                    ["template", "Template"],
                    ["ai", "AI generated architecture"],
                  ] as [StartFrom, string][]
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      type="radio"
                      name="startFrom"
                      value={value}
                      checked={startFrom === value}
                      onChange={() => setStartFrom(value)}
                      className="size-4 accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>

              {startFrom === "template" ? (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="project-template"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Template
                  </label>
                  <select
                    id="project-template"
                    value={templateId}
                    onChange={(event) => setTemplateId(event.target.value)}
                    className="h-10 w-full rounded-sm border border-border bg-muted px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {startFrom === "ai" ? (
                <div className="flex flex-col gap-3">
                  <TextArea
                    label="Describe your system"
                    id="system-description"
                    value={systemDescription}
                    onChange={(event) =>
                      setSystemDescription(event.target.value)
                    }
                    placeholder="I want to build a scalable video streaming platform..."
                    rows={4}
                  />
                  <button
                    type="button"
                    disabled={!systemDescription.trim()}
                    onClick={() => {}}
                    className="flex items-center justify-center gap-2 cursor-pointer rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="size-4" aria-hidden="true" />
                    Generate Architecture
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm cursor-pointer border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
