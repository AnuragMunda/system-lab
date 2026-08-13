// Browseable grid of starter templates surfaced on the dashboard.
import Link from "next/link";
import { templates } from "@/data/dashboard-data";
import { TemplateCard } from "./template-card";

// Section header plus a responsive card grid of available templates (up to 4 per row).
export function ExploreTemplates() {
  return (
    <section aria-labelledby="explore-templates-heading">
      <div className="flex items-center justify-between">
        <h2
          id="explore-templates-heading"
          className="text-sm font-medium tracking-tight text-foreground"
        >
          Explore Templates
        </h2>
        <Link
          href="/dashboard/templates"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse all
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
