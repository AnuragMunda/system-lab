// Personalized dashboard header: a time-of-day greeting plus a "New Project" CTA.
import { Plus } from "lucide-react";

// Returns a greeting based on the current local hour (morning/afternoon/evening).
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Renders the greeting line and primary CTA. `name` is the current user's name.
export function GreetingHeader({ name }: { name: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}, {name}.
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ready to build something interesting?
        </p>
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        New Project
      </button>
    </div>
  );
}
