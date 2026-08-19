"use client";

// Architecture editor route: `/projects/[id]/architectures/[architectureId]`.
// Reads the architecture from the workspace context (already loaded) and hands it to
// the EditorShell. Renders a minimal loading state while the graph resolves.
import { useParams } from "next/navigation";

import { useWorkspace } from "@/components/workspace/workspace-context";
import { EditorShell } from "@/features/editor/components/EditorShell";

export default function ArchitectureEditorPage() {
  const params = useParams();
  const architectureId = String(params.architectureId);
  const { project, architectures } = useWorkspace();

  const architecture = architectures.find((a) => a.id === architectureId);

  if (!architecture) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading architecture…
      </div>
    );
  }

  return (
    <EditorShell architecture={architecture} projectName={project?.name ?? "Project"} />
  );
}
