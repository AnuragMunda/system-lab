// Grid of recently updated projects sourced from dashboard seed data.
import Link from "next/link";
import { recentProjects } from "@/data/dashboard-data";
import { ProjectCard } from "./project-card";

// Section header plus a responsive card grid of recent projects (max 3 per row).
export function RecentProjects() {
  return (
    <section aria-labelledby="recent-projects-heading">
      <div className="flex items-center justify-between">
        <h2
          id="recent-projects-heading"
          className="text-sm font-medium tracking-tight text-foreground"
        >
          Recent Projects
        </h2>
        <Link
          href="/dashboard/projects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
