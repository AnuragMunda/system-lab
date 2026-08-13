// A single project summary card showing health, description, and key stats.
import { Boxes, Clock, FlaskConical, Users } from "lucide-react";
import type { Project, ProjectHealth } from "@/data/dashboard-data";

// Maps each ProjectHealth to its dot colour, text colour, and display label.
const HEALTH_STYLES: Record<ProjectHealth, { dot: string; text: string; label: string }> = {
  healthy: { dot: "bg-success", text: "text-success", label: "Healthy" },
  degraded: { dot: "bg-accent", text: "text-accent", label: "Degraded" },
  critical: { dot: "bg-danger", text: "text-danger", label: "Critical" },
};

// Clickable card for one Project; `project` drives the name, health, and stats.
export function ProjectCard({ project }: { project: Project }) {
  const health = HEALTH_STYLES[project.health];

  return (
    <button
      type="button"
      className="group flex flex-col gap-3 rounded-md border border-border bg-card p-4 text-left transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{project.name}</h3>
        <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs ${health.text}`}>
          <span className={`size-1.5 rounded-full ${health.dot}`} aria-hidden="true" />
          {health.label}
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Boxes className="size-3.5" aria-hidden="true" />
          {project.nodeCount} nodes
        </span>
        <span className="flex items-center gap-1.5">
          <FlaskConical className="size-3.5" aria-hidden="true" />
          {project.simulationCount} sims
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden="true" />
          {project.collaborators}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-muted-foreground/70">
          <Clock className="size-3.5" aria-hidden="true" />
          {project.lastModified}
        </span>
      </div>
    </button>
  );
}
