"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export function FlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
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

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke: "var(--color-border-strong)", strokeWidth: 1.5 }}
      />
      <BaseEdge
        path={edgePath}
        className="animate-flow"
        style={{ stroke: "var(--color-primary)", strokeWidth: 1.5 }}
      />
    </>
  );
}
