"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { initialNodes, initialEdges } from "./architecture-data";
import { SystemNode } from "./system-node";
import { FlowEdge } from "./flow-edge";

const nodeTypes = { systemNode: SystemNode };
const edgeTypes: EdgeTypes = { flow: FlowEdge };

export function ArchitectureCanvas() {
  const edges = useMemo(
    () => initialEdges.map((edge) => ({ ...edge, type: "flow" })),
    [],
  );

  return (
    <div className="h-[420px] w-full rounded-lg border border-border bg-card/40">
      <ReactFlowProvider>
        <ReactFlow
          nodes={initialNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          preventScrolling={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="var(--color-border)"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
