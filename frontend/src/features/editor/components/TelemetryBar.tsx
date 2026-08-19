"use client";

// Bottom telemetry strip. Shows architecture-wide metrics — live simulation values
// while running, otherwise the baseline estimates derived from node configs.
import { useAppSelector } from "@/store/hooks";
import { computeBaselineTelemetry } from "../telemetry";
import type { ArchitectureTelemetry } from "../types";

function formatTraffic(rps: number): string {
  if (rps >= 1000) return `${(rps / 1000).toFixed(1)}K req/s`;
  return `${Math.round(rps)} req/s`;
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`font-mono text-sm font-medium ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function TelemetryBar() {
  const running = useAppSelector((s) => s.editor.simulation.running);
  const live = useAppSelector((s) => s.editor.simulation.telemetry);
  const nodes = useAppSelector((s) => s.editor.nodes);

  const t: ArchitectureTelemetry = running
    ? live
    : computeBaselineTelemetry(nodes);

  const errorPct = (t.errorRate * 100).toFixed(2);

  return (
    <footer className="flex h-12 shrink-0 items-center gap-6 overflow-x-auto border-t border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${running ? "animate-pulse-dot bg-primary" : "bg-muted-foreground"}`}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {running ? "Live" : "Idle"}
        </span>
      </div>
      <Metric label="Traffic" value={formatTraffic(t.traffic)} accent />
      <Metric label="P95" value={`${t.p95}ms`} />
      <Metric
        label="Errors"
        value={`${errorPct}%`}
        accent={t.errorRate >= 0.05}
      />
      <Metric label="CPU" value={`${t.cpu}%`} />
      <Metric label="Memory" value={`${t.memory}%`} />
      <Metric label="Cost" value={`$${Math.round(t.cost).toLocaleString()}/mo`} />
    </footer>
  );
}
