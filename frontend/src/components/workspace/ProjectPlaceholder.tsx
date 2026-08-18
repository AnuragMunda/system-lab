// Shared "coming soon" placeholder used by the non-Overview project nav tabs
// (Architectures, Simulations, Experiments, Scenarios, Metrics, Incidents, Cost,
// Versions, Team). Those pages aren't built yet, so the tab simply lands here.
// The surrounding layout already provides the padded container, so this renders
// just the centered card.
import Link from "next/link";
import { Construction } from "lucide-react";

// Renders a centered placeholder for an unimplemented workspace section.
export function ProjectPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border bg-card/40 px-6 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
        <Construction className="size-5" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          This section is coming soon. The project overview already surfaces
          simulations, experiments, and activity — this dedicated view is on
          the roadmap.
        </p>
      </div>
      <Link
        href="../"
        className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted"
      >
        Back to Overview
      </Link>
    </div>
  );
}
