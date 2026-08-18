// Architectures tab view: section header (eyebrow + project name + tagline +
// "New Architecture"), a search/sort toolbar, and a searchable/sortable list of
// architecture rows. Reads architectures + project from the workspace context.
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { buildArchitectureCards } from "@/data/project-overview";
import { deleteArchitectureApi } from "@/lib/api/architectures";
import { ArchitectureListItem } from "./ArchitectureListItem";
import { toast } from "@/lib/utils";

// Sort options surfaced in the toolbar dropdown.
const SORT_OPTIONS: {
  value: "recent" | "name" | "components" | "simulations";
  label: string;
}[] = [
  { value: "recent", label: "Recently modified" },
  { value: "name", label: "Name" },
  { value: "components", label: "Components" },
  { value: "simulations", label: "Simulations" },
];

// Renders the full Architectures tab for the current project.
export function ArchitecturesView() {
  const { projectId, architectures, reload } = useWorkspace();
  const [query, setQuery] = useState("");
  const [sort, setSort] =
    useState<(typeof SORT_OPTIONS)[number]["value"]>("recent");

  // Pair each raw architecture with its enriched card, then filter + sort.
  const items = useMemo(() => {
    const cards = buildArchitectureCards(architectures);
    const paired = architectures.map((raw, i) => ({ raw, card: cards[i] }));

    const q = query.trim().toLowerCase();
    const filtered = paired.filter(
      (p) =>
        !q ||
        p.card.name.toLowerCase().includes(q) ||
        p.card.description.toLowerCase().includes(q),
    );

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.card.name.localeCompare(b.card.name);
        case "components":
          return b.card.componentCount - a.card.componentCount;
        case "simulations":
          return b.card.simulations - a.card.simulations;
        case "recent":
        default:
          return (
            new Date(b.raw.updatedAt).getTime() -
            new Date(a.raw.updatedAt).getTime()
          );
      }
    });
  }, [architectures, query, sort]);

  async function handleDelete(id: string) {
    try {
      await deleteArchitectureApi(id);
      reload();
    } catch {
      toast("Failed to delete architecture.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Architectures
          </h1>
          <p className="text-sm text-muted-foreground">
            Different designs for your system.
          </p>
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
              placeholder="Search architectures..."
              aria-label="Search architectures"
              className="w-full rounded-sm border border-border bg-card py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-border-strong focus:border-border-strong focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="arch-sort">
              Sort architectures
            </label>
            <select
              id="arch-sort"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value as (typeof SORT_OPTIONS)[number]["value"],
                )
              }
              className="rounded-sm border border-border bg-card px-2.5 py-1.5 text-sm text-foreground transition-colors hover:border-border-strong focus:border-border-strong focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              </select>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No architectures match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <ArchitectureListItem
              key={p.card.id}
              card={p.card}
              projectId={projectId}
              onDeleted={handleDelete}
              onUpdated={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
