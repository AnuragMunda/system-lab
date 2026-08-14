// Vertical activity feed of recent lab events, rendered as a connected timeline.
import {
  Bot,
  Boxes,
  CheckCircle2,
  PlayCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { labActivity, type ActivityKind } from "@/data/dashboard-data";

// Maps each ActivityKind to the icon and colour shown in its timeline node.
const KIND_META: Record<ActivityKind, { icon: LucideIcon; color: string }> = {
  "architecture-created": { icon: Boxes, color: "text-primary" },
  "simulation-completed": { icon: CheckCircle2, color: "text-success" },
  "scenario-executed": { icon: PlayCircle, color: "text-accent" },
  "collaborator-joined": { icon: UserPlus, color: "text-foreground" },
  "ai-recommendation": { icon: Bot, color: "text-primary" },
};

// Renders the "Your Lab Activity" aside with icons, titles, details, and timestamps.
export function ActivityPanel() {
  return (
    <aside
      aria-labelledby="lab-activity-heading"
      className="flex flex-col rounded-md border border-border bg-card"
    >
      <div className="border-b border-border px-4 py-3.5">
        <h2 id="lab-activity-heading" className="text-sm font-medium text-foreground">
          Your Lab Activity
        </h2>
      </div>

      <ol className="flex flex-col gap-4 px-4 py-4">
        {labActivity.map((item, index) => {
          const { icon: Icon, color } = KIND_META[item.kind];
          return (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background ${color}`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                {index !== labActivity.length - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
                ) : null}
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm text-foreground">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.detail}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">
                  {item.timestamp}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
