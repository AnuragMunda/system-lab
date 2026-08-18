// Project Overview page (`/projects/[id]`): the workspace landing tab. Reads the
// project's architectures from the workspace context and composes the health strip,
// architectures grid, comparison, and recent simulations/experiments/activity.
"use client";

import { useWorkspace } from "@/components/workspace/workspace-context";
import { deleteArchitectureApi } from "@/lib/api/architectures";
import {
  buildArchitectureCards,
  PROJECT_HEALTH_DEFAULTS,
} from "@/data/project-overview";
import { ProjectHealth } from "@/components/workspace/ProjectHealth";
import { ArchitecturesSection } from "@/components/workspace/ArchitecturesSection";
import { ArchitectureComparison } from "@/components/workspace/ArchitectureComparison";
import { RecentSimulations } from "@/components/workspace/RecentSimulations";
import { RecentExperiments } from "@/components/workspace/RecentExperiments";
import { RecentActivity } from "@/components/workspace/RecentActivity";
import { toast } from "@/lib/utils";

// Renders the full Overview tab content for the current project.
export default function ProjectOverviewPage() {
  const { projectId, architectures, reload } = useWorkspace();
  const cards = buildArchitectureCards(architectures);
  const health = {
    ...PROJECT_HEALTH_DEFAULTS,
    architectures: architectures.length,
  };

  // Deletes an architecture, then refreshes the grid via the context reload.
  async function handleDelete(id: string) {
    try {
      await deleteArchitectureApi(id);
      reload();
    } catch {
      toast("Failed to delete architecture.");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <ProjectHealth health={health} />

      <ArchitecturesSection
        projectId={projectId}
        cards={cards}
        onCreated={reload}
        onDeleted={handleDelete}
      />

      <ArchitectureComparison architectureNames={cards.map((card) => card.name)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentSimulations />
        <RecentExperiments />
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
