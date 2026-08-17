// Recently updated projects, sourced from the same backend-backed store as the
// Projects page (capped at the three most recent). Client component so it can
// read the store and trigger the initial fetch.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ProjectCard } from "./ui/project-card";
import { fetchProjects } from "@/store/projectsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

// Section header plus a responsive card grid of the three most recent projects.
export function RecentProjects() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.items);
  const status = useAppSelector((state) => state.projects.status);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProjects());
  }, [status, dispatch]);

  const recent = projects
    .slice()
    .sort((a, b) => a.activityRank - b.activityRank)
    .slice(0, 3);

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
          href="/projects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {status === "loading" ? "Loading projects…" : "No recent projects yet."}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
