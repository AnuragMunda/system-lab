// Canonical project card used by both the dashboard's Recent Projects and the
// full Projects page. Renders the project identity, architecture summary, headline
// metrics, owner/activity, and a footer with "Open Project" + a "•••" menu.
// `view` switches between a vertical grid card and a compact horizontal list row.
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Beaker,
  Boxes,
  Clock,
  FlaskConical,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Project } from "@/data/dashboard-data";
import { HEALTH_STYLES } from "@/lib/health";
import { EditProjectDialog } from "@/components/dashboard/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/dashboard/delete-project-dialog";

// Architecture chips shown before collapsing into a "+N more" affordance.
const MAX_ARCHITECTURES = 3;

// Small health pill reused in both grid and list layouts.
function HealthBadge({ health }: { health: Project["health"] }) {
  const styles = HEALTH_STYLES[health];
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs ${styles.value}`}
    >
      <span className={`size-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {styles.label}
    </span>
  );
}

// One metric in the stats row: icon + label.
function Stat({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

// Architecture summary: up to MAX_ARCHITECTURES chips, then a "+N more" remainder.
function ArchitectureSummary({ architectures }: { architectures: string[] }) {
  const visible = architectures.slice(0, MAX_ARCHITECTURES);
  const extra = architectures.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((name) => (
        <span
          key={name}
          className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-primary/60" aria-hidden="true" />
          {name}
        </span>
      ))}
      {extra > 0 ? (
        <span className="font-mono text-[11px] text-muted-foreground/70">
          +{extra} more
        </span>
      ) : null}
    </div>
  );
}

// Footer actions shared by both views: "Open Project" link plus a "•••" menu
// (Open / Edit / Delete). Edit opens the project-edit modal.
function ProjectActions({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const href = `/projects/${project.id}`;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
      >
        Open Project
      </Link>

      <div className="relative">
        <button
          type="button"
          aria-label="Project actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex size-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div
              role="menu"
              className="absolute bottom-10 right-0 z-50 w-40 overflow-hidden rounded-md border border-border bg-card shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                Open
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setEditOpen(true);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                Delete
              </button>
            </div>
          </>
        ) : null}
      </div>

      <EditProjectDialog
        project={project}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <DeleteProjectDialog
        project={project}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}

// Renders one project as a grid card or list row based on `view`.
export function ProjectCard({
  project,
  view = "grid",
}: {
  project: Project;
  view?: "grid" | "list";
}) {
  const href = `/projects/${project.id}`;

  if (view === "list") {
    return (
      <article className="group flex items-center gap-4 rounded-md border border-border bg-card p-4 transition-colors hover:border-border-strong">
        <Link href={href} className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">
              {project.name}
            </h3>
            <HealthBadge health={project.health} />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {project.description}
          </p>
        </Link>

        <div className="hidden shrink-0 flex-col gap-1 border-l border-border pl-4 md:flex">
          <ArchitectureSummary architectures={project.architectures} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Stat icon={Boxes} label={`${project.componentCount} components`} />
            <Stat icon={FlaskConical} label={`${project.simulationCount} sims`} />
            <Stat icon={Beaker} label={`${project.experimentCount} exp`} />
          </div>
        </div>

        <div className="hidden shrink-0 flex-col gap-1 text-xs text-muted-foreground lg:flex">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden="true" />
            {project.owner}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {project.lastActivity}
          </span>
        </div>

        <ProjectActions project={project} />
      </article>
    );
  }

  return (
    <article className="group flex flex-col rounded-md border border-border bg-card transition-colors hover:border-border-strong">
      <Link href={href} className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">{project.name}</h3>
          <HealthBadge health={project.health} />
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <ArchitectureSummary architectures={project.architectures} />

        <div className="mt-1 space-y-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Stat icon={Boxes} label={`${project.componentCount} components`} />
            <Stat icon={FlaskConical} label={`${project.simulationCount} simulations`} />
            <Stat icon={Beaker} label={`${project.experimentCount} experiments`} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              {project.owner}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {project.lastActivity}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <ProjectActions project={project} />
      </div>
    </article>
  );
}
