import { AlertCircle } from "lucide-react";

// Renders a single inline form/global error message with an alert icon.
// Returns null when there is no message to display.
export function FormError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-danger"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
