// RECENT SIMULATIONS section: seeded simulations grouped by architecture, each
// with a pass/degraded/failed status pill.
"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import {
  RECENT_SIMULATIONS,
  type SimulationStatus,
} from "@/data/project-overview";

// Status → icon + color mapping for the simulation outcome pill.
const STATUS_STYLES: Record<
  SimulationStatus,
  { icon: typeof Check; className: string; label: string }
> = {
  passed: { icon: Check, className: "text-success", label: "Passed" },
  degraded: { icon: AlertTriangle, className: "text-accent", label: "Degraded" },
  failed: { icon: X, className: "text-danger", label: "Failed" },
};

// Renders the recent simulations list (seeded).
export function RecentSimulations() {
  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent Simulations
      </h2>
      <ul className="flex flex-col divide-y divide-border">
        {RECENT_SIMULATIONS.map((sim) => {
          const styles = STATUS_STYLES[sim.status];
          const Icon = styles.icon;
          return (
            <li
              key={`${sim.name}-${sim.architecture}`}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {sim.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {sim.architecture}
                </span>
              </div>
              <span className={`flex items-center gap-1 text-xs ${styles.className}`}>
                <Icon className="size-3.5" aria-hidden="true" />
                {styles.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
