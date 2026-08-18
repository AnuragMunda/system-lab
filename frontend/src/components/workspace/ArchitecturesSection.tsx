// ARCHITECTURES section of the workspace Overview: heading + responsive grid of
// architecture cards (optionally capped to a preview) followed by a "Create New
// Architecture" call-to-action card, with a "View all" link to the full tab.
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArchitectureCard } from "./ArchitectureCard";
import { CreateArchitectureCard } from "./CreateArchitectureCard";
import type { ArchitectureOverviewCard } from "@/data/project-overview";

// Renders the architectures grid with the create card appended. When `limit` is
// set, only that many cards are shown and a "View all" link is offered.
export function ArchitecturesSection({
  projectId,
  cards,
  onCreated,
  onDeleted,
  onUpdated,
  limit,
}: {
  projectId: string;
  cards: ArchitectureOverviewCard[];
  onCreated: () => void;
  onDeleted: (id: string) => void;
  onUpdated: () => void;
  limit?: number;
}) {
  const visible = limit ? cards.slice(0, limit) : cards;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Architectures
          </h2>
          <p className="text-sm text-muted-foreground">Your system designs</p>
        </div>

        {limit && cards.length > 0 ? (
          <Link
            href={`/projects/${projectId}/architectures`}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {cards.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No architectures yet — create your first design to start simulating.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((card) => (
            <ArchitectureCard
              key={card.id}
              card={card}
              projectId={projectId}
              onDeleted={onDeleted}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}

      <CreateArchitectureCard projectId={projectId} onCreated={onCreated} />
    </section>
  );
}
