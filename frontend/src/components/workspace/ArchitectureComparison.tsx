// ARCHITECTURE COMPARISON section: pick two architectures and view seeded deltas
// for P95, availability, and cost. The "Compare Architectures" action routes to a
// placeholder since the dedicated comparison view isn't built yet.
"use client";

import { useState } from "react";
import { ArrowRight, GitCompare } from "lucide-react";
import { toast } from "@/lib/utils";
import { COMPARISON_DEFAULTS } from "@/data/project-overview";

// A single compared metric row: label, left value → right value.
function CompareRow({
  label,
  left,
  right,
}: {
  label: string;
  left: string;
  right: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-mono text-sm text-foreground">
        {left}
        <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
        {right}
      </span>
    </div>
  );
}

// Renders the architecture comparison strip with the seeded default pair.
export function ArchitectureComparison({
  architectureNames,
}: {
  architectureNames: string[];
}) {
  const names = architectureNames.length
    ? architectureNames
    : [COMPARISON_DEFAULTS.left, COMPARISON_DEFAULTS.right];
  const [left, setLeft] = useState(names[0]);
  const [right, setRight] = useState(names[1] ?? names[0]);
  const { p95, availability, cost } = COMPARISON_DEFAULTS;

  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Architecture Comparison
          </h2>
          <p className="text-sm text-muted-foreground">Compare your designs.</p>
        </div>
        <button
          type="button"
          onClick={() => toast("Comparison view coming soon")}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
        >
          <GitCompare className="size-3.5" aria-hidden="true" />
          Compare Architectures
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={left}
          onChange={(event) => setLeft(event.target.value)}
          aria-label="Left architecture"
          className="rounded-sm border border-border bg-background px-2.5 py-1.5 text-sm text-foreground transition-colors focus:border-border-strong focus:outline-none"
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground">vs</span>
        <select
          value={right}
          onChange={(event) => setRight(event.target.value)}
          aria-label="Right architecture"
          className="rounded-sm border border-border bg-background px-2.5 py-1.5 text-sm text-foreground transition-colors focus:border-border-strong focus:outline-none"
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <CompareRow label="P95" left={p95[0]} right={p95[1]} />
        <CompareRow label="Availability" left={availability[0]} right={availability[1]} />
        <CompareRow label="Cost" left={cost[0]} right={cost[1]} />
      </div>
    </section>
  );
}
