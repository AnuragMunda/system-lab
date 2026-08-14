// Shared health state + its color/label mapping, used across the landing
// architecture canvas and the dashboard project cards. Keeping the literal
// Tailwind class strings inline so the JIT scanner can detect them; only the
// underlying color token and label are centralized here.

export type Health = "healthy" | "degraded" | "critical";

// The design token each health state maps to (success / accent / danger).
export const HEALTH_COLOR_TOKEN: Record<
  Health,
  "success" | "accent" | "danger"
> = {
  healthy: "success",
  degraded: "accent",
  critical: "danger",
};

// Human-readable label shown next to each health state.
export const HEALTH_LABEL: Record<Health, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  critical: "Critical",
};

// Full literal Tailwind class map. `edgeVar` references the CSS color variable
// (not a utility class) so it stays safe to keep as a string value.
export const HEALTH_STYLES: Record<
  Health,
  {
    icon: string;
    value: string;
    dot: string;
    border: string;
    edgeVar: string;
    label: string;
  }
> = {
  healthy: {
    icon: "text-success",
    value: "text-success",
    dot: "bg-success",
    border: "border-success/40",
    edgeVar: "var(--color-success)",
    label: "Healthy",
  },
  degraded: {
    icon: "text-accent",
    value: "text-accent",
    dot: "bg-accent",
    border: "border-accent/40",
    edgeVar: "var(--color-accent)",
    label: "Degraded",
  },
  critical: {
    icon: "text-danger",
    value: "text-danger",
    dot: "bg-danger",
    border: "border-danger/40",
    edgeVar: "var(--color-danger)",
    label: "Critical",
  },
};
