// Delete Architecture confirmation modal, opened from a card's "..." menu. Asks
// the user to confirm, then calls the parent's delete handler (which performs
// the backend delete + reload). Controlled by the parent (open/onClose);
// Cancel/Esc/backdrop dismiss without changes.
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Inner modal content. Mounted only while `open`, so its state starts fresh each open.
function DeleteArchitectureModalContent({
  architecture,
  onClose,
  onDeleted,
}: {
  architecture: { id: string; name: string };
  onClose: () => void;
  onDeleted: () => void;
}) {
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

  function handleDelete() {
    onDeleted();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-architecture-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-md border border-border bg-card shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="delete-architecture-title"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Delete Architecture
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
            <span className="font-medium text-foreground">
              {architecture.name}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

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
export function DeleteArchitectureDialog({
  architecture,
  open,
  onClose,
  onDeleted,
}: {
  architecture: { id: string; name: string };
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  if (!open) return null;
  return createPortal(
    <DeleteArchitectureModalContent
      architecture={architecture}
      onClose={onClose}
      onDeleted={onDeleted}
    />,
    document.body,
  );
}
