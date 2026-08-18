// Large architecture card for the workspace Overview's ARCHITECTURES grid.
// Identity + component count are real (from the API); the rest comes from seeded
// enrichment. Cost-optimized architectures surface a monthly cost instead of error rate.
"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Play, SquareArrowOutUpRight } from "lucide-react";
import { HEALTH_STYLES } from "@/lib/health";
import { toast } from "@/lib/utils";
import { EditArchitectureDialog } from "./EditArchitectureDialog";
import { DeleteArchitectureDialog } from "./DeleteArchitectureDialog";
import type { ArchitectureOverviewCard } from "@/data/project-overview";

// Small label/value metric row used in the card body.
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

// Renders one architecture as a large overview card with a ••• action menu.
export function ArchitectureCard({
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const simHref = `/projects/${projectId}/simulations`;
  const archHref = `/projects/${projectId}/architectures`;

  return (
    <article className="flex flex-col rounded-md border border-border bg-card transition-colors hover:border-border-strong">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {card.name}
          </h3>
          <span
            className={`flex shrink-0 items-center gap-1.5 text-xs ${styles.value}`}
          >
            <span
              className={`size-1.5 rounded-full ${styles.dot}`}
              aria-hidden="true"
            />
            {styles.label}
          </span>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {card.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3">
          <Metric label="Components" value={String(card.componentCount)} />
          <Metric label="Latest simulation" value={card.latestSimulation} />
          <Metric label="P95" value={card.p95} />
          {card.cost ? (
            <Metric label="Cost" value={card.cost} />
          ) : (
            <Metric label="Error rate" value={card.errorRate ?? "—"} />
          )}
          <Metric label="Version" value={card.version} />
          <Metric label="Last modified" value={card.lastModified} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={archHref}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <SquareArrowOutUpRight className="size-3.5" aria-hidden="true" />
            Open Architecture
          </Link>
          <Link
            href={simHref}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <Play className="size-3.5" aria-hidden="true" />
            Run Simulation
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Architecture actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="cursor-pointer inline-flex size-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                className="fixed inset-0 z-40"
              />
              <div
                role="menu"
                className="absolute bottom-10 right-0 z-50 w-44 overflow-hidden rounded-md border border-border bg-card shadow-lg"
              >
                <Link
                  href={archHref}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Open
                </Link>
                <Link
                  href={simHref}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Run Simulation
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="cursor-pointer block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    toast("Architecture duplicated (coming soon)");
                  }}
                  className="cursor-pointer block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="cursor-pointer block w-full px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-muted"
                >
                  Delete
                </button>
              </div>
            </>
          ) : null}
        </div>

        <EditArchitectureDialog
          architecture={{
            id: card.id,
            name: card.name,
            description: card.description,
          }}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={onUpdated}
        />

        <DeleteArchitectureDialog
          architecture={{ id: card.id, name: card.name }}
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => onDeleted(card.id)}
        />
      </div>
    </article>
  );
}
