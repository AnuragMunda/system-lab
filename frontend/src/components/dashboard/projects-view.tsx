// Projects page body: header with the "New Project" CTA, a toolbar for
// search / filter / sort / grid-list toggle, and a grid or list of ProjectCards.
// All controls are client-side over the static `projects` fixture set.
"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { projects, type Project } from "@/data/dashboard-data";
import { ProjectCard } from "./ui/project-card";
import { NewProjectDialog } from "./new-project-dialog";

// Health filter values surfaced in the Filter dropdown.
const HEALTH_FILTERS = [
  { value: "all", label: "All health" },
  { value: "healthy", label: "Healthy" },
  { value: "degraded", label: "Degraded" },
  { value: "critical", label: "Critical" },
] as const;

// Sort options surfaced in the Sort dropdown.
const SORT_OPTIONS = [
  { value: "activity", label: "Last activity" },
  { value: "name", label: "Name" },
  { value: "components", label: "Components" },
  { value: "simulations", label: "Simulations" },
  { value: "health", label: "Health" },
] as const;

// Severity order for the "Health" sort (healthy first).
const HEALTH_ORDER: Record<Project["health"], number> = {
  healthy: 0,
  degraded: 1,
  critical: 2,
};

// Renders the Projects header, toolbar, and project grid/list.
export function ProjectsView() {
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<(typeof HEALTH_FILTERS)[number]["value"]>("all");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("activity");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Filter by search term + health, then sort by the selected key.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const matchesQuery =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q);
      const matchesHealth = healthFilter === "all" || project.health === healthFilter;
      return matchesQuery && matchesHealth;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "components":
          return b.componentCount - a.componentCount;
        case "simulations":
          return b.simulationCount - a.simulationCount;
        case "health":
          return HEALTH_ORDER[a.health] - HEALTH_ORDER[b.health];
        case "activity":
        default:
          return a.activityRank - b.activityRank;
      }
    });

    return sorted;
  }, [query, healthFilter, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your system laboratories.
          </p>
        </div>

        <NewProjectDialog />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
            className="w-full rounded-sm border border-border bg-card py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-border-strong focus:border-border-strong focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="health-filter">
            Filter by health
          </label>
          <select
            id="health-filter"
            value={healthFilter}
            onChange={(event) =>
              setHealthFilter(
                event.target.value as (typeof HEALTH_FILTERS)[number]["value"],
              )
            }
            className="rounded-sm border border-border bg-card px-2.5 py-1.5 text-sm text-foreground transition-colors hover:border-border-strong focus:border-border-strong focus:outline-none"
          >
            {HEALTH_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="sort">
            Sort projects
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as (typeof SORT_OPTIONS)[number]["value"])
            }
            className="rounded-sm border border-border bg-card px-2.5 py-1.5 text-sm text-foreground transition-colors hover:border-border-strong focus:border-border-strong focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>

          <div
            role="group"
            aria-label="Toggle view"
            className="flex items-center rounded-sm border border-border"
          >
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={`flex size-8 items-center justify-center transition-colors ${
                view === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`flex size-8 items-center justify-center border-l border-border transition-colors ${
                view === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No projects match your filters.
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} view="list" />
          ))}
        </div>
      )}
    </div>
  );
}
