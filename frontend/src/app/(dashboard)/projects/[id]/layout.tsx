// Project workspace layout (`/projects/[id]/*`) — a client layout that fetches the
// project + its architectures, renders the shared header (breadcrumb + title +
// actions) and the section tab bar, and provides the data to section pages via
// context. Inherits the dashboard shell (sidebar + top nav + auth guard).
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectHeader } from "@/components/workspace/ProjectHeader";
import { ProjectNav } from "@/components/workspace/ProjectNav";
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from "@/components/workspace/workspace-context";
import { getProjectApi, type BackendProject } from "@/lib/api/projects";
import {
  listArchitecturesApi,
  type BackendArchitecture,
} from "@/lib/api/architectures";

// Renders the workspace chrome (header + nav) and supplies data to the section.
export default function ProjectWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = String(params.id);
  const [project, setProject] = useState<BackendProject | null>(null);
  const [architectures, setArchitectures] = useState<BackendArchitecture[]>([]);

  // Load the project + its architectures once per project id.
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [p, archs] = await Promise.all([
          getProjectApi(projectId),
          listArchitecturesApi(projectId),
        ]);
        if (!active) return;
        setProject(p);
        setArchitectures(archs);
      } catch {
        // Section pages render their own empty/error states; header falls back
        // to a neutral label so the workspace still loads.
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  // Re-fetch architectures after a create/delete (project is unchanged).
  const reload = useCallback(() => {
    listArchitecturesApi(projectId)
      .then(setArchitectures)
      .catch(() => {});
  }, [projectId]);

  const value: WorkspaceContextValue = { projectId, architectures, reload };

  return (
    <WorkspaceContext.Provider value={value}>
      <ProjectHeader
        projectId={projectId}
        name={project?.name ?? "Project"}
        description={project?.description ?? ""}
        onCreated={reload}
      />
      <ProjectNav projectId={projectId} />
      <div className="mx-auto w-full max-w-350 px-6 py-8">{children}</div>
    </WorkspaceContext.Provider>
  );
}
