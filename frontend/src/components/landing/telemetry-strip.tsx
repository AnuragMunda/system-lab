import { Boxes, Spline } from "lucide-react";
import { initialNodes, initialEdges } from "./architecture-data";

export function TelemetryStrip() {
  const nodes = initialNodes.length;
  const edges = initialEdges.length;
  const healthy = initialNodes.filter((n) => n.data.health === "healthy").length;
  const degraded = initialNodes.filter((n) => n.data.health === "degraded").length;
  const critical = initialNodes.filter((n) => n.data.health === "critical").length;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-border bg-card/40 px-3 py-1.5 font-mono text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Boxes className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-foreground">{nodes}</span> nodes
      </span>
      <span className="flex items-center gap-1.5">
        <Spline className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-foreground">{edges}</span> edges
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-success animate-pulse-dot" />
        <span className="text-foreground">{healthy}</span> healthy
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-accent animate-pulse-dot" />
        <span className="text-foreground">{degraded}</span> degrading
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-danger animate-pulse-dot" />
        <span className="text-foreground">{critical}</span> critical
      </span>
    </div>
  );
}
