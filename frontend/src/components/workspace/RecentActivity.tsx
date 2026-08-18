// RECENT ACTIVITY section: seeded feed of actor + action + target + relative time.
"use client";

import { Activity } from "lucide-react";
import { RECENT_ACTIVITY } from "@/data/project-overview";

// Renders the recent activity feed (seeded).
export function RecentActivity() {
  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent Activity
      </h2>
      <ul className="flex flex-col gap-3">
        {RECENT_ACTIVITY.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
              <Activity className="size-3.5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm text-foreground">
                <span className="font-medium">{item.actor}</span> {item.action}{" "}
                <span className="font-medium">{item.target}</span>
              </span>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
