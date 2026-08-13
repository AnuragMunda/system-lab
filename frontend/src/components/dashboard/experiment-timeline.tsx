// Timeline list of the user's most recent experiments and their outcomes.
import Link from "next/link";
import { CheckCircle2, CircleDashed, Timer, XCircle } from "lucide-react";
import { recentExperiments, type ExperimentStatus } from "@/data/dashboard-data";

// Maps each ExperimentStatus to its icon, text colour, and display label.
const STATUS_STYLES: Record<
  ExperimentStatus,
  { icon: typeof CheckCircle2; text: string; label: string }
> = {
  passed: { icon: CheckCircle2, text: "text-success", label: "Passed" },
  failed: { icon: XCircle, text: "text-danger", label: "Failed" },
  running: { icon: CircleDashed, text: "text-accent", label: "Running" },
};

// Section header plus a bordered, ordered list of recent experiments by status.
export function ExperimentTimeline() {
  return (
    <section aria-labelledby="recent-experiments-heading">
      <div className="flex items-center justify-between">
        <h2
          id="recent-experiments-heading"
          className="text-sm font-medium tracking-tight text-foreground"
        >
          Recent Experiments
        </h2>
        <Link
          href="/dashboard/experiments"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <ol className="mt-4 flex flex-col rounded-md border border-border bg-card">
        {recentExperiments.map((experiment, index) => {
          const status = STATUS_STYLES[experiment.status];
          const StatusIcon = status.icon;
          return (
            <li
              key={experiment.id}
              className={`flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 ${
                index !== recentExperiments.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <StatusIcon
                className={`size-4 shrink-0 ${status.text} ${
                  experiment.status === "running" ? "animate-pulse-dot" : ""
                }`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {experiment.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground/70">
                    {experiment.project}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {experiment.scenario} &mdash; {experiment.result}
                </p>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground sm:shrink-0">
                <span className="flex items-center gap-1.5">
                  <Timer className="size-3.5" aria-hidden="true" />
                  {experiment.duration}
                </span>
                <span className="hidden sm:inline">{experiment.date}</span>
                <span className={`w-14 text-right ${status.text}`}>{status.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
