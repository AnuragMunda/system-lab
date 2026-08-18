// New Architecture dialog: choose Blank / From Template / Duplicate / Generate with AI.
// "Blank" creates a real architecture (POST /api/v1/architectures, empty graph) and
// triggers `onCreated`. The other three are UI scaffolds the backend doesn't persist yet.
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, FilePlus2, Sparkles, LayoutTemplate, X } from "lucide-react";
import { AuthInput } from "@/components/auth/ui/auth-input";
import { TextArea } from "@/components/dashboard/project-form-fields";
import { createArchitectureApi } from "@/lib/api/architectures";
import { toast } from "@/lib/utils";

// The four creation entry points surfaced in the dialog.
const OPTIONS = [
  {
    key: "blank",
    label: "Blank Architecture",
    desc: "Start from an empty canvas.",
    icon: FilePlus2,
  },
  {
    key: "template",
    label: "From Template",
    desc: "Scaffold from a starter topology.",
    icon: LayoutTemplate,
  },
  {
    key: "duplicate",
    label: "Duplicate Existing",
    desc: "Clone one of your architectures.",
    icon: Copy,
  },
  {
    key: "ai",
    label: "Generate with AI",
    desc: "Describe a system, get a design.",
    icon: Sparkles,
  },
] as const;

type OptionKey = (typeof OPTIONS)[number]["key"];

// Renders a trigger and, when opened, the creation modal. `trigger` receives the
// open handler so any element (header button or create card) can launch it.
export function NewArchitectureDialog({
  projectId,
  onCreated,
  trigger,
}: {
  projectId: string;
  onCreated?: () => void;
  trigger: (open: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<OptionKey>("blank");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

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

  function reset() {
    setOption("blank");
    setName("");
    setDescription("");
    setError(null);
    setCreating(false);
  }

  async function handleCreate() {
    if (option !== "blank") {
      toast(`${OPTIONS.find((o) => o.key === option)?.label} is coming soon`);
      setOpen(false);
      reset();
      return;
    }
    if (!name.trim()) {
      setError("Give your architecture a name.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createArchitectureApi({
        projectId,
        name: name.trim(),
        description: description.trim() || undefined,
        nodes: [],
        edges: [],
      });
      onCreated?.();
      setOpen(false);
      reset();
    } catch {
      setError("Something went wrong creating your architecture.");
      setCreating(false);
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
            aria-labelledby="create-architecture-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-md border border-border bg-card shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2
                id="create-architecture-title"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                Create New Architecture
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

            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = option === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setOption(opt.key)}
                      className={`cursor-pointer flex flex-col gap-2 rounded-md border p-3 text-left transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border-strong hover:bg-muted"
                      }`}
                    >
                      <Icon
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {opt.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {option === "blank" ? (
                <div className="flex flex-col gap-4">
                  <AuthInput
                    label="Name"
                    name="new-architecture-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    ref={nameRef}
                  />
                  <TextArea
                    label="Description"
                    id="new-architecture-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe this architecture…"
                    rows={3}
                  />
                </div>
              ) : (
                <p className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                  This option is coming soon — choose Blank Architecture to
                  create one now.
                </p>
              )}

              {error ? <p className="text-sm text-danger">{error}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || (option === "blank" && !name.trim())}
                className="cursor-pointer rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create Architecture"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {trigger(() => setOpen(true))}
      {modal}
    </>
  );
}
