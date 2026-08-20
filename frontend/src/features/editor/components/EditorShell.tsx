"use client";

// Editor shell: lays out the toolbar, left palette, canvas (~70%), right inspector
// and AI panel, and the bottom telemetry bar. Hosts the ReactFlowProvider so the
// toolbar can drive zoom/fit. Runs the client simulation loop and debounced autosave.
import { useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { store } from "@/store";
import {
  applySimulation,
  initEditor,
  markSaved,
  setSaving,
} from "@/store/editorSlice";
import { updateArchitectureApi } from "@/lib/api/architectures";
import { toast } from "@/lib/utils";
import { deserializeEdge, deserializeNode, serializeEdge, serializeNode } from "../serialize";
import { simulateStep } from "../simEngine";
import { TopToolbar } from "./TopToolbar";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { Inspector } from "./Inspector";
import { AIPanel } from "./AIPanel";
import { TelemetryBar } from "./TelemetryBar";
import type { BackendArchitecture } from "@/lib/api/architectures";

export function EditorShell({
  architecture,
  projectName,
}: {
  architecture: BackendArchitecture;
  projectName: string;
}) {
  const dispatch = useAppDispatch();
  const [zoom, setZoom] = useState(1);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const running = useAppSelector((s) => s.editor.simulation.running);
  const dirty = useAppSelector((s) => s.editor.dirty);
  const name = useAppSelector((s) => s.editor.name);
  const tickRef = useRef(0);

  // Load the architecture into the editor once.
  useEffect(() => {
    dispatch(
      initEditor({
        architectureId: architecture.id,
        projectId: architecture.projectId,
        name: architecture.name,
        description: architecture.description,
        nodes: architecture.graph.nodes.map(deserializeNode),
        edges: architecture.graph.edges.map(deserializeEdge),
      }),
    );
  }, [architecture, dispatch]);

  // Client-side simulation loop: tick on an interval while running, reading the
  // latest graph straight from the store to avoid resetting the timer on edits.
  useEffect(() => {
    if (!running) return;
    tickRef.current = 0;
    const id = window.setInterval(() => {
      tickRef.current += 1;
      const { nodes, edges } = store.getState().editor;
      const res = simulateStep(nodes, edges, tickRef.current);
      dispatch(
        applySimulation({
          tick: tickRef.current,
          telemetry: res.telemetry,
          nodeMetrics: res.nodeMetrics,
          edgeMetrics: res.edgeMetrics,
        }),
      );
    }, 700);
    return () => window.clearInterval(id);
  }, [running, dispatch]);

  // Debounced autosave whenever the graph is dirty.
  useEffect(() => {
    if (!dirty || !architecture.id) return;
    const handle = window.setTimeout(async () => {
      const { nodes, edges } = store.getState().editor;
      dispatch(setSaving(true));
      try {
        await updateArchitectureApi(architecture.id, {
          name,
          nodes: nodes.map(serializeNode),
          edges: edges.map(serializeEdge),
        });
        dispatch(markSaved(new Date().toISOString()));
      } catch {
        dispatch(setSaving(false));
        toast("Failed to save architecture");
      }
    }, 2000);
    return () => window.clearTimeout(handle);
  }, [dirty, architecture.id, name, dispatch]);

  return (
    <ReactFlowProvider>
      <div className="editor-root flex h-full flex-col">
        <TopToolbar projectName={projectName} projectId={architecture.projectId} zoom={zoom} />
        <div className="flex min-h-0 flex-1">
          <ComponentPalette
            collapsed={paletteCollapsed}
            onToggle={() => setPaletteCollapsed((c) => !c)}
          />
          <div className="min-w-0 flex-1">
            <Canvas onZoomChange={setZoom} />
          </div>
          <Inspector
            collapsed={inspectorCollapsed}
            onToggle={() => setInspectorCollapsed((c) => !c)}
          />
          <AIPanel />
        </div>
        <TelemetryBar />
      </div>
    </ReactFlowProvider>
  );
}
