"use client";

// Landing architecture preview — a read-only ReactFlow diagram of a sample
// system that demonstrates the product's visual canvas.
import { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { initialNodes, initialEdges } from "@/data/architecture-data";
import { SystemNode } from "./system-node";
import { FlowEdge } from "./flow-edge";

const nodeTypes = { systemNode: SystemNode };
const edgeTypes: EdgeTypes = { flow: FlowEdge };

// ArchitectureCanvas — renders the interactive ReactFlow preview of the sample
// architecture. Nodes and edges are static (non-interactive) decorations.
export function ArchitectureCanvas() {
  // Map of node id -> its health, used to colour each inbound edge below.
  const healthByNode = useMemo(
    () => new Map(initialNodes.map((n) => [n.id, n.data.health])),
    [],
  );

  // Each edge's data.health is derived from its TARGET node, so the inbound edge
  // reflects the health of the connected node it points to.
  const edges = useMemo(
    () =>
      initialEdges.map((edge) => ({
        ...edge,
        type: "flow",
        data: { ...edge.data, health: healthByNode.get(edge.target) ?? "healthy" },
      })),
    [healthByNode],
  );

  return (
    <div className="h-105 w-full rounded-lg border border-border bg-card/45">
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
