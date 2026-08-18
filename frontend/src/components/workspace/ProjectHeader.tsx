// Project workspace header: breadcrumb (Projects / {name}), title, description,
// and the action row ([+ New Architecture] [Run Simulation] [Share] [•••]).
// "New Architecture" opens the real creation dialog; the rest route to placeholders
// or fire a transient toast since those flows aren't built yet.
"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Play, Plus, Share2 } from "lucide-react";
import { NewArchitectureDialog } from "./NewArchitectureDialog";
import { toast } from "@/lib/utils";

// Renders the workspace header for a single project.
export function ProjectHeader({
  projectId,
  name,
  description,
  onCreated,
}: {
  projectId: string;
  name: string;
  description: string;
  onCreated: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const simHref = `/projects/${projectId}/simulations`;

  function handleShare() {
    setMenuOpen(false);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(typeof window !== "undefined" ? window.location.href : "")
        .catch(() => {});
    }
    toast("Share link copied to clipboard");
  }

  return (
    <header className="flex flex-col gap-4 px-6 py-6">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/projects" className="transition-colors hover:text-foreground">
          Projects
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
            {name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {description || "No description provided."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NewArchitectureDialog
            projectId={projectId}
            onCreated={onCreated}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                <Plus className="size-4" aria-hidden="true" />
                New Architecture
              </button>
            )}
          />

          <Link
            href={simHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <Play className="size-4" aria-hidden="true" />
            Run Simulation
          </Link>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share project"
            className="inline-flex size-10 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:border-border-strong hover:bg-muted"
          >
            <Share2 className="size-4" aria-hidden="true" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="More project actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex size-10 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:border-border-strong hover:bg-muted"
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
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute bottom-11 right-0 z-50 w-44 overflow-hidden rounded-md border border-border bg-card shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleShare}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      toast("Project settings coming soon");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      toast("Duplicate project coming soon");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      toast("Delete project coming soon");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-muted"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
