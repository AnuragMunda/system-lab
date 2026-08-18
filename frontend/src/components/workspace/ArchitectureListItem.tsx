// Compact architecture row for the workspace Architectures tab. Shows health,
// description, headline stats (components / version / simulations / last modified),
// and the action row [Open] [Simulate] [Compare] [•••]. "Open" has no editor yet
// (toast); "Simulate" routes to the placeholder; "Compare" toasts; "Delete" is real.
"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Play, GitCompare, SquareArrowOutUpRight } from "lucide-react";
import { HEALTH_STYLES } from "@/lib/health";
import { toast } from "@/lib/utils";
import { EditArchitectureDialog } from "./EditArchitectureDialog";
import type { ArchitectureOverviewCard } from "@/data/project-overview";

// Renders one architecture as a compact, full-width list row.
export function ArchitectureListItem({
  card,
  projectId,
  onDeleted,
  onUpdated,
}: {
  card: ArchitectureOverviewCard;
  projectId: string;
  onDeleted: (id: string) => void;
  onUpdated: () => void;
}) {
  const styles = HEALTH_STYLES[card.health];
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const simHref = `/projects/${projectId}/simulations`;

  return (
    <article className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-1.5 size-2 shrink-0 rounded-full ${styles.dot}`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {card.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {card.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>{card.componentCount} components</span>
          <span>{card.version}</span>
          <span>{card.simulations} simulations</span>
          <span>Last modified: {card.lastModified}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast("Architecture editor coming soon")}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <SquareArrowOutUpRight className="size-3.5" aria-hidden="true" />
            Open
          </button>
          <Link
            href={simHref}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <Play className="size-3.5" aria-hidden="true" />
            Simulate
          </Link>
          <button
            type="button"
            onClick={() => toast("Comparison coming soon")}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <GitCompare className="size-3.5" aria-hidden="true" />
            Compare
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Architecture actions"
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
                    onClick={() => {
                      setMenuOpen(false);
                      toast("Architecture editor coming soon");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Open
                  </button>
                  <Link
                    href={simHref}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Simulate
                  </Link>
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
                      toast("Comparison coming soon");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleted(card.id);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-muted"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <EditArchitectureDialog
          architecture={{ id: card.id, name: card.name, description: card.description }}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={onUpdated}
        />
      </div>
    </article>
  );
}
