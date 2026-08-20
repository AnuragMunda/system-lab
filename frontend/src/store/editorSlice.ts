// Redux slice for the Architecture Editor. Holds the canvas graph (nodes/edges),
// selection, undo/redo history, clipboard, autosave status, the (client) simulation
// state, and the AI panel visibility. Designed to be the single source of truth that
// React Flow renders from; the canvas dispatches change/connect handlers back here.
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { createNode } from "../features/editor/serialize";
import type {
  ArchitectureTelemetry,
  ComponentKind,
  EditorEdge,
  EditorEdgeData,
  EditorNode,
  EditorNodeData,
  Protocol,
} from "../features/editor/types";
import type { Health } from "@/lib/health";

interface HistorySnapshot {
  nodes: EditorNode[];
  edges: EditorEdge[];
}

interface SimulationState {
  running: boolean;
  tick: number;
  telemetry: ArchitectureTelemetry;
}

interface EditorState {
  architectureId: string | null;
  projectId: string | null;
  name: string;
  description: string | null;
  nodes: EditorNode[];
  edges: EditorEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  clipboard: { nodes: EditorNode[]; edges: EditorEdge[] } | null;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  dirty: boolean;
  saving: boolean;
  lastSavedAt: string | null;
  simulation: SimulationState;
  aiPanelOpen: boolean;
}

const EMPTY_TELEMETRY: ArchitectureTelemetry = {
  traffic: 0,
  p95: 0,
  errorRate: 0,
  cpu: 0,
  memory: 0,
  cost: 0,
};

const initialState: EditorState = {
  architectureId: null,
  projectId: null,
  name: "",
  description: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  clipboard: null,
  past: [],
  future: [],
  dirty: false,
  saving: false,
  lastSavedAt: null,
  simulation: { running: false, tick: 0, telemetry: EMPTY_TELEMETRY },
  aiPanelOpen: false,
};

const HISTORY_LIMIT = 50;

function clone(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function pushSnapshot(state: EditorState) {
  const current = {
    nodes: clone(state.nodes) as EditorNode[],
    edges: clone(state.edges) as EditorEdge[],
  };
  const top = state.past[state.past.length - 1];
  if (top && JSON.stringify(top) === JSON.stringify(current)) return;
  state.past.push(current);
  if (state.past.length > HISTORY_LIMIT) state.past.shift();
  state.future = [];
}

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    /** Loads a full architecture into the editor, clearing history. */
    initEditor(
      state,
      action: PayloadAction<{
        architectureId: string;
        projectId: string;
        name: string;
        description: string | null;
        nodes: EditorNode[];
        edges: EditorEdge[];
      }>,
    ) {
      const { architectureId, projectId, name, description, nodes, edges } =
        action.payload;
      state.architectureId = architectureId;
      state.projectId = projectId;
      state.name = name;
      state.description = description;
      state.nodes = nodes;
      state.edges = edges;
      state.selectedNodeId = null;
      state.selectedEdgeId = null;
      state.past = [];
      state.future = [];
      state.dirty = false;
      state.simulation = { running: false, tick: 0, telemetry: EMPTY_TELEMETRY };
    },

    /** Captures the current graph before an undoable interaction begins. */
    snapshot(state) {
      pushSnapshot(state);
    },

    onNodesChange(state, action: PayloadAction<NodeChange<EditorNode>[]>) {
      const userChange = action.payload.some(
        (c) => c.type !== "select" && c.type !== "dimensions",
      );
      state.nodes = applyNodeChanges(action.payload, state.nodes);
      if (userChange) state.dirty = true;
    },

    onEdgesChange(state, action: PayloadAction<EdgeChange<EditorEdge>[]>) {
      const userChange = action.payload.some((c) => c.type !== "select");
      state.edges = applyEdgeChanges(action.payload, state.edges);
      if (userChange) state.dirty = true;
    },

    onConnect(state, action: PayloadAction<Connection>) {
      const { source, target } = action.payload;
      if (!source || !target || source === target) return;
      pushSnapshot(state);
      const edge: EditorEdge = {
        id: crypto.randomUUID(),
        source,
        target,
        type: "connection",
        data: { protocol: "http" as Protocol, trafficRate: 0, latencyMs: 10 },
      };
      state.edges.push(edge);
      state.dirty = true;
    },

    addNode(
      state,
      action: PayloadAction<{ kind: ComponentKind; position: { x: number; y: number } }>,
    ) {
      pushSnapshot(state);
      state.nodes.forEach((n) => (n.selected = false));
      state.edges.forEach((e) => (e.selected = false));
      const node = createNode(action.payload.kind, action.payload.position);
      node.selected = true;
      state.nodes.push(node);
      state.selectedNodeId = node.id;
      state.selectedEdgeId = null;
      state.dirty = true;
    },

    setSelection(
      state,
      action: PayloadAction<{ nodeId: string | null; edgeId: string | null }>,
    ) {
      const { nodeId, edgeId } = action.payload;
      state.selectedNodeId = nodeId;
      state.selectedEdgeId = edgeId;
    },

    beginEdit(state) {
      // Called by the inspector on field focus so a whole edit session collapses
      // into a single undo step (the push is deduped against the current state).
      pushSnapshot(state);
    },

    updateNodeData(
      state,
      action: PayloadAction<{ id: string; patch: Partial<EditorNodeData> }>,
    ) {
      const node = state.nodes.find((n) => n.id === action.payload.id);
      if (!node) return;
      node.data = { ...node.data, ...action.payload.patch };
      state.dirty = true;
    },

    updateEdgeData(
      state,
      action: PayloadAction<{ id: string; patch: Partial<EditorEdgeData> }>,
    ) {
      const edge = state.edges.find((e) => e.id === action.payload.id);
      if (!edge) return;
      edge.data = { ...(edge.data ?? ({} as EditorEdgeData)), ...action.payload.patch };
      state.dirty = true;
    },

    deleteSelected(state) {
      const nodeIds = new Set(
        state.nodes
          .filter((n) => n.selected)
          .map((n) => n.id)
          .concat(state.selectedNodeId ? [state.selectedNodeId] : []),
      );
      const edgeIds = new Set(
        state.edges
          .filter((e) => e.selected)
          .map((e) => e.id)
          .concat(state.selectedEdgeId ? [state.selectedEdgeId] : []),
      );
      if (nodeIds.size === 0 && edgeIds.size === 0) return;
      pushSnapshot(state);
      state.nodes = state.nodes.filter((n) => !nodeIds.has(n.id));
      state.edges = state.edges.filter(
        (e) => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target),
      );
      state.selectedNodeId = null;
      state.selectedEdgeId = null;
      state.dirty = true;
    },

    copySelection(state) {
      const nodes = state.nodes.filter((n) => n.selected);
      if (nodes.length === 0) {
        state.clipboard = null;
        return;
      }
      const ids = new Set(nodes.map((n) => n.id));
      const edges = state.edges.filter(
        (e) => ids.has(e.source) && ids.has(e.target),
      );
      state.clipboard = {
        nodes: clone(nodes) as EditorNode[],
        edges: clone(edges) as EditorEdge[],
      };
    },

    paste(state) {
      if (!state.clipboard || state.clipboard.nodes.length === 0) return;
      pushSnapshot(state);
      const idMap = new Map<string, string>();
      const pasted: EditorNode[] = state.clipboard.nodes.map((n) => {
        const id = crypto.randomUUID();
        idMap.set(n.id, id);
        return {
          ...(clone(n) as EditorNode),
          id,
          selected: true,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
        } as EditorNode;
      });
      const pastedEdges: EditorEdge[] = state.clipboard.edges.map((e) => ({
        ...(clone(e) as EditorEdge),
        id: crypto.randomUUID(),
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
        selected: false,
      })) as EditorEdge[];
      state.nodes.forEach((n) => (n.selected = false));
      state.nodes.push(...pasted);
      state.edges.push(...pastedEdges);
      state.selectedNodeId = pasted[0]?.id ?? null;
      state.selectedEdgeId = null;
      state.dirty = true;
    },

    undo(state) {
      const prev = state.past.pop();
      if (!prev) return;
      state.future.push({
        nodes: clone(state.nodes) as EditorNode[],
        edges: clone(state.edges) as EditorEdge[],
      });
      state.nodes = prev.nodes;
      state.edges = prev.edges;
      state.dirty = true;
    },

    redo(state) {
      const next = state.future.pop();
      if (!next) return;
      state.past.push({
        nodes: clone(state.nodes) as EditorNode[],
        edges: clone(state.edges) as EditorEdge[],
      });
      state.nodes = next.nodes;
      state.edges = next.edges;
      state.dirty = true;
    },

    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
      state.dirty = true;
    },

    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
    },

    markSaved(state, action: PayloadAction<string>) {
      state.dirty = false;
      state.saving = false;
      state.lastSavedAt = action.payload;
    },

    injectFailure(state, action: PayloadAction<string>) {
      const node = state.nodes.find((n) => n.id === action.payload);
      if (!node) return;
      node.data = {
        ...node.data,
        health: "critical" as Health,
        live: node.data.live
          ? { ...node.data.live, errorRate: 0.6, cpu: 98, p95: node.data.live.p95 * 4 }
          : undefined,
      };
    },

    startSimulation(state) {
      state.simulation.running = true;
      state.simulation.tick = 0;
    },

    stopSimulation(state) {
      state.simulation.running = false;
      state.nodes.forEach((n) => {
        n.data = { ...n.data, live: undefined };
      });
      state.edges.forEach((e) => {
        e.data = e.data ? { ...e.data, live: undefined } : e.data;
      });
      state.simulation.telemetry = EMPTY_TELEMETRY;
    },

    applySimulation(
      state,
      action: PayloadAction<{
        tick: number;
        telemetry: ArchitectureTelemetry;
        nodeMetrics: Record<string, EditorNodeData["live"]>;
        edgeMetrics: Record<string, EditorEdgeData["live"]>;
      }>,
    ) {
      const { tick, telemetry, nodeMetrics, edgeMetrics } = action.payload;
      state.simulation.tick = tick;
      state.simulation.telemetry = telemetry;
      state.nodes.forEach((n) => {
        const m = nodeMetrics[n.id];
        if (m) n.data = { ...n.data, live: m, health: healthFromError(m.errorRate) };
      });
      state.edges.forEach((e) => {
        const m = edgeMetrics[e.id];
        if (m && e.data) e.data = { ...e.data, live: m };
      });
    },

    toggleAiPanel(state) {
      state.aiPanelOpen = !state.aiPanelOpen;
    },
  },
});

function healthFromError(errorRate: number): Health {
  if (errorRate >= 0.2) return "critical";
  if (errorRate >= 0.05) return "degraded";
  return "healthy";
}

export const {
  initEditor,
  snapshot,
  onNodesChange,
  onEdgesChange,
  onConnect,
  addNode,
  setSelection,
  beginEdit,
  updateNodeData,
  updateEdgeData,
  deleteSelected,
  copySelection,
  paste,
  undo,
  redo,
  setName,
  setSaving,
  markSaved,
  injectFailure,
  startSimulation,
  stopSimulation,
  applySimulation,
  toggleAiPanel,
} = editorSlice.actions;

export default editorSlice.reducer;
