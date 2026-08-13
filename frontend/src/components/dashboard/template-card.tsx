// A single starter-template card with category, stack tags, and complexity.
import { ArrowUpRight, Boxes } from "lucide-react";
import type { Template } from "@/data/dashboard-data";

// Maps template complexity to its accent colour (Beginner→success, Advanced→danger).
const COMPLEXITY_STYLES: Record<Template["complexity"], string> = {
  Beginner: "text-success",
  Intermediate: "text-accent",
  Advanced: "text-danger",
};

// Clickable card for one Template; `template` drives category, stack, and stats.
export function TemplateCard({ template }: { template: Template }) {
  return (
    <button
      type="button"
      className="group flex flex-col gap-3 rounded-md border border-border bg-card p-4 text-left transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
            {template.category}
          </p>
          <h3 className="mt-1 text-sm font-medium text-foreground">{template.name}</h3>
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {template.stack.map((item) => (
          <span
            key={item}
            className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Boxes className="size-3.5" aria-hidden="true" />
          {template.nodeCount} nodes
        </span>
        <span className={COMPLEXITY_STYLES[template.complexity]}>
          {template.complexity}
        </span>
      </div>
    </button>
  );
}
