// Shared context for the project workspace layout: exposes the project's
// architectures and a reload helper to the active section (Overview page) so it can
// refresh after create/delete without re-fetching the project itself.
"use client";

import { createContext, useContext } from "react";
import type { BackendArchitecture } from "@/lib/api/architectures";
import type { BackendProject } from "@/lib/api/projects";

// Value provided by the workspace layout to its section pages.
export interface WorkspaceContextValue {
  projectId: string;
  project: BackendProject | null;
  architectures: BackendArchitecture[];
  reload: () => void;
}

// Context instance; null outside the workspace layout.
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// Accesses the workspace context. Throws if used outside the layout.
export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a project workspace layout");
  }
  return ctx;
}
