"use client";

// A single system node in the landing architecture diagram — shows the node
// kind icon, label, health dot, and live-style metrics (req/s, latency, cpu, replicas).
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Database,
  Layers,
  ListOrdered,
  Router,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SystemFlowNode, SystemNodeKind } from "@/data/architecture-data";
import { HEALTH_STYLES } from "@/data/architecture-data";

const KIND_ICON: Record<SystemNodeKind, LucideIcon> = {
  gateway: Router,
  service: Layers,
  cache: Zap,
  queue: ListOrdered,
  database: Database,
};

// SystemNode — renders one node card. The icon, metric values, health dot, and
// border are all driven by HEALTH_STYLES[data.health].
export function SystemNode({ data }: NodeProps<SystemFlowNode>) {
  const Icon = KIND_ICON[data.kind];
  // All visual treatment (icon colour, value colour, dot, border) is pulled from
  // HEALTH_STYLES for the node's current health.
  const styles = HEALTH_STYLES[data.health];
  const healthLabel =
    data.health === "healthy"
      ? "Healthy"
      : data.health === "critical"
        ? "Critical"
        : "Degraded";

  return (
    <div
      className={`w-47.5 rounded-md border bg-card/95 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] ${styles.border}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2 !border-border-strong !bg-muted-foreground"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-border-strong !bg-muted-foreground"
      />

      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Icon className={`size-3.5 ${styles.icon}`} aria-hidden="true" />
        <span className="flex-1 truncate text-xs font-medium text-foreground">
          {data.label}
        </span>
        <span
          className={`size-1.5 rounded-full ${styles.dot} animate-pulse-dot`}
          aria-label={healthLabel}
          role="status"
        />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-3 py-2 font-mono text-[10px] leading-none text-muted-foreground">
        <div className="flex items-baseline justify-between">
          <span>req/s</span>
          <span className="text-foreground">{data.rps.toLocaleString()}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>p50</span>
          <span className={styles.value}>{data.latencyMs}ms</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>cpu</span>
          <span className={styles.value}>{data.cpu}%</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>repl</span>
          <span className="text-foreground">×{data.replicas}</span>
        </div>
      </div>
    </div>
  );
}
