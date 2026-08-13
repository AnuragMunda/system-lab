"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { HEALTH_STYLES } from "./architecture-data";

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
