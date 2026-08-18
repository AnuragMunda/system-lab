// Project health headline: a stat strip (Architectures count is real; simulations,
// experiments, and active incidents are seeded) plus an overall status pill.
import {
  AlertTriangle,
  Beaker,
  Boxes,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import type { ProjectHealthOverview } from "@/data/project-overview";

// Color tokens + labels for the overall status pill.
const STATUS_STYLES: Record<
  ProjectHealthOverview["overallStatus"],
  { dot: string; text: string; label: string }
> = {
  operational: { dot: "bg-success", text: "text-success", label: "Operational" },
  degraded: { dot: "bg-accent", text: "text-accent", label: "Degraded" },
  incident: { dot: "bg-danger", text: "text-danger", label: "Incident" },
};

// One stat tile in the health strip.
function HealthStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-card px-4 py-3">
      <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
    </div>
  );
}

// Renders the PROJECT HEALTH section for the workspace overview.
export function ProjectHealth({
  health,
}: {
  health: ProjectHealthOverview;
}) {
  const status = STATUS_STYLES[health.overallStatus];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Project Health
        </h2>
        <span
          className={`flex items-center gap-1.5 text-sm font-medium ${status.text}`}
        >
          <span
            className={`size-2 rounded-full ${status.dot} animate-pulse-dot`}
            aria-hidden="true"
          />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HealthStat icon={Boxes} value={health.architectures} label="Architectures" />
        <HealthStat icon={FlaskConical} value={health.simulations} label="Simulations" />
        <HealthStat icon={Beaker} value={health.experiments} label="Experiments" />
        <HealthStat
          icon={AlertTriangle}
          value={health.activeIncidents}
          label="Active Incidents"
        />
      </div>
    </section>
  );
}
