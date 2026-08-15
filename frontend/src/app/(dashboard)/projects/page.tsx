// Projects route (`/projects`) — the full project library with search,
// filter, sort, and grid/list views. Interactive body lives in ProjectsView.
import type { Metadata } from "next";
import { ProjectsView } from "@/components/dashboard/projects-view";

// Page-level metadata for the projects screen.
export const metadata: Metadata = {
  title: "Projects | System Labs",
  description: "Browse and manage your System Labs project laboratories.",
};

// Renders the projects workspace inside the dashboard shell.
export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-350 px-6 py-8">
      <ProjectsView />
    </div>
  );
}
