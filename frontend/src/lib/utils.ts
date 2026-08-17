export type FormErrors = Record<string, string | undefined>;

// Formats an ISO date string into a short relative label ("just now", "5m ago",
// "3h ago", "2d ago", "1w ago"). Falls back to an empty string on invalid input.
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return `${Math.floor(days / 7)}w ago`;
}

export interface ValidationRule {
  required?: string;
  pattern?: { value: RegExp; message: string };
  match?: { field: string; message: string };
  checked?: { message: string };
  custom?: (
    value: unknown,
    values: Record<string, unknown>,
  ) => string | undefined;
}

export type ValidationSchema = Record<string, ValidationRule>;

// Runs every rule in `schema` against `values` and returns only the fields
// that failed (key → message). An empty object means the form is valid.
export function validateForm(
  values: Record<string, unknown>,
  schema: ValidationSchema,
): FormErrors {
  const errors: FormErrors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const value = values[field];

    if (rule.required) {
      const str = typeof value === "string" ? value.trim() : "";
      if (!str) {
        errors[field] = rule.required;
        continue;
      }
    }
    if (rule.checked && !value) {
      errors[field] = rule.checked.message;
      continue;
    }
    if (
      rule.pattern &&
      typeof value === "string" &&
      !rule.pattern.value.test(value)
    ) {
      errors[field] = rule.pattern.message;
      continue;
    }
    if (
      rule.match &&
      String(value ?? "") !== String(values[rule.match.field] ?? "")
    ) {
      errors[field] = rule.match.message;
      continue;
    }
    if (rule.custom) {
      const message = rule.custom(value, values);
      if (message) {
        errors[field] = message;
        continue;
      }
    }
  }
  return errors;
}
