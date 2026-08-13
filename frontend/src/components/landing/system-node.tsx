"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Database,
  Layers,
  ListOrdered,
  Router,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SystemFlowNode, SystemNodeKind } from "./architecture-data";

const KIND_ICON: Record<SystemNodeKind, LucideIcon> = {
  gateway: Router,
  service: Layers,
  cache: Zap,
  queue: ListOrdered,
  database: Database,
};

export function SystemNode({ data }: NodeProps<SystemFlowNode>) {
  const Icon = KIND_ICON[data.kind];
  const isHealthy = data.health === "healthy";

  return (
    <div className="w-[190px] rounded-md border border-border bg-card/95 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]">
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
        <Icon className="size-3.5 text-primary" aria-hidden="true" />
        <span className="flex-1 truncate text-xs font-medium text-foreground">
          {data.label}
        </span>
        <span
          className={`size-1.5 rounded-full ${isHealthy ? "bg-success animate-pulse-dot" : "bg-accent animate-pulse-dot"}`}
          aria-label={isHealthy ? "Healthy" : "Degraded"}
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
          <span className="text-foreground">{data.latencyMs}ms</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>cpu</span>
          <span className={data.cpu > 70 ? "text-accent" : "text-foreground"}>
            {data.cpu}%
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>repl</span>
          <span className="text-foreground">×{data.replicas}</span>
        </div>
      </div>
    </div>
  );
}
