// ARCHITECTURES section of the workspace Overview: heading + responsive grid of
// architecture cards followed by the "Create New Architecture" call-to-action card.
"use client";

import { ArchitectureCard } from "./ArchitectureCard";
import { CreateArchitectureCard } from "./CreateArchitectureCard";
import type { ArchitectureOverviewCard } from "@/data/project-overview";

// Renders the architectures grid with the create card appended.
export function ArchitecturesSection({
  projectId,
  cards,
  onCreated,
  onDeleted,
}: {
  projectId: string;
  cards: ArchitectureOverviewCard[];
  onCreated: () => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Architectures
        </h2>
        <p className="text-sm text-muted-foreground">Your system designs</p>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No architectures yet — create your first design to start simulating.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <ArchitectureCard
              key={card.id}
              card={card}
              projectId={projectId}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      )}

      <CreateArchitectureCard projectId={projectId} onCreated={onCreated} />
    </section>
  );
}
