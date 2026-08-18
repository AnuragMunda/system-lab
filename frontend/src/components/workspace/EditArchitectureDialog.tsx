// "Edit Architecture" modal — opened from a card's "•••" menu. Prefilled with the
// architecture's current name + description and, on submit, calls the backend update
// endpoint. Uses the same AuthInput/TextArea primitives as the New Architecture dialog.
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AuthInput } from "@/components/auth/ui/auth-input";
import { TextArea } from "@/components/dashboard/project-form-fields";
import { updateArchitectureApi } from "@/lib/api/architectures";

// The architecture identity/values prefilled into the form.
export interface EditArchitectureTarget {
  id: string;
  name: string;
  description: string;
}

// Inner modal content. Mounted only while `open`, so state initializes from the
// current architecture on every open (no need to reset via an effect).
function EditArchitectureModalContent({
  architecture,
  onClose,
  onUpdated,
}: {
  architecture: EditArchitectureTarget;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(architecture.name);
  const [description, setDescription] = useState(architecture.description);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

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
    if (!name.trim()) {
      setError("Give your architecture a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateArchitectureApi(architecture.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onUpdated();
      onClose();
    } catch {
      setError("Something went wrong updating your architecture.");
      setSaving(false);
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
        aria-labelledby="edit-architecture-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-md border border-border bg-card shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="edit-architecture-title"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Edit Architecture
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
          <AuthInput
            label="Name"
            name="edit-architecture-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            ref={nameRef}
          />
          <TextArea
            label="Description"
            id="edit-architecture-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe this architecture…"
            rows={3}
          />
        </div>

        {error ? <p className="px-5 pb-1 text-sm text-danger">{error}</p> : null}

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving || !name.trim()}
            className="rounded-sm cursor-pointer bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Update Architecture"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Controlled wrapper: renders the modal only while `open`.
export function EditArchitectureDialog({
  architecture,
  open,
  onClose,
  onUpdated,
}: {
  architecture: EditArchitectureTarget;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  if (!open) return null;
  return createPortal(
    <EditArchitectureModalContent
      architecture={architecture}
      onClose={onClose}
      onUpdated={onUpdated}
    />,
    document.body,
  );
}
