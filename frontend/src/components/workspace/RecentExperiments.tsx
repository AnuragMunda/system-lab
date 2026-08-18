// RECENT EXPERIMENTS section: seeded table of experiments comparing two architectures.
"use client";

import { Check } from "lucide-react";
import { RECENT_EXPERIMENTS } from "@/data/project-overview";

// Renders the recent experiments table (seeded).
export function RecentExperiments() {
  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent Experiments
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Experiment</th>
              <th className="py-2 pr-4 font-medium">Architectures Compared</th>
              <th className="py-2 font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RECENT_EXPERIMENTS.map((exp) => (
              <tr key={exp.name}>
                <td className="py-2.5 pr-4 font-medium text-foreground">
                  {exp.name}
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {exp.architecturesCompared}
                </td>
                <td className="py-2.5">
                  <span className="flex items-center gap-1.5 text-success">
                    <Check className="size-3.5" aria-hidden="true" />
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
