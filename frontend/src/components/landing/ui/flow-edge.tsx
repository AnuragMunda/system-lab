"use client";

// Animated edge for the landing architecture diagram — a static base line
// overlaid with a flowing pulse whose colour encodes the connected node's health.
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { HEALTH_STYLES } from "@/data/architecture-data";

// FlowEdge — renders a single diagram edge with an animated overlay.
export function FlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  // The animated stroke colour comes from HEALTH_STYLES[health].edgeVar,
  // so the pulse matches the target node's health state.
  const flowColor =
    HEALTH_STYLES[(data?.health as keyof typeof HEALTH_STYLES) ?? "healthy"].edgeVar;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke: "var(--color-border-strong)", strokeWidth: 1.5 }}
      />
      <BaseEdge
        path={edgePath}
        className="animate-flow"
        style={{ stroke: flowColor, strokeWidth: 1.5 }}
      />
    </>
  );
}
