// Client-side mock simulation engine. Given the current graph, it propagates
// request traffic from entry nodes (clients / sources) through the topology,
// derives per-node load, latency, errors and CPU, and aggregates an
// architecture-wide telemetry snapshot. Pure function — the editor drives it on a
// timer and dispatches the result into the store. No backend required.
import type {
  ArchitectureTelemetry,
  EditorEdge,
  EditorEdgeData,
  EditorNode,
  EditorNodeData,
} from "./types";
import { nodeMonthlyCost } from "./catalog";

export interface SimResult {
  nodeMetrics: Record<string, EditorNodeData["live"]>;
  edgeMetrics: Record<string, EditorEdgeData["live"]>;
  telemetry: ArchitectureTelemetry;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function jitter(base: number, pct: number): number {
  return base * (1 + (Math.random() - 0.5) * pct);
}

/**
 * Computes one (noisy) simulation step for the given graph.
 * @param tick monotonically increasing step index (used for deterministic noise)
 */
export function simulateStep(
  nodes: EditorNode[],
  edges: EditorEdge[],
  tick: number,
): SimResult {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, EditorEdge[]>();
  const incoming = new Map<string, EditorEdge[]>();
  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    (outgoing.get(e.source) ?? outgoing.set(e.source, []).get(e.source)!).push(e);
    (incoming.get(e.target) ?? incoming.set(e.target, []).get(e.target)!).push(e);
  }

  // Entry nodes = clients or nodes with no incoming edges.
  const entry = nodes.filter(
    (n) => n.data.kind === "client" || (incoming.get(n.id)?.length ?? 0) === 0,
  );
  const rps = new Map<string, number>();
  for (const n of entry) rps.set(n.id, Math.max(0, n.data.traffic));

  // Propagate flows across the graph for a fixed number of iterations (handles cycles).
  for (let i = 0; i < 24; i++) {
    const next = new Map(rps);
    for (const n of nodes) {
      const outs = outgoing.get(n.id) ?? [];
      if (outs.length === 0) continue;
      const flow = (rps.get(n.id) ?? 0) / outs.length;
      for (const e of outs) {
        next.set(e.target, (next.get(e.target) ?? 0) + flow);
      }
    }
    for (const [id, v] of next) rps.set(id, v);
  }

  const nodeMetrics: Record<string, EditorNodeData["live"]> = {};
  const edgeMetrics: Record<string, EditorEdgeData["live"]> = {};
  let traffic = 0;
  let wLatency = 0;
  let wError = 0;
  let wCpu = 0;
  let wMem = 0;
  let weight = 0;
  let cost = 0;

  for (const n of nodes) {
    const d = n.data;
    const load = rps.get(n.id) ?? 0;
    const capacity = Math.max(1, d.capacity ?? 1000);
    const replicas = Math.max(1, d.replicas);
    const util = load / (capacity * replicas);

    const overloaded = util > 1;
    const base = d.latencyMs * (1 + Math.max(0, util - 1) * 2.2);
    const noise = (Math.sin(tick * 0.7 + load) + 1) * 0.5;
    const latency = jitter(base * (1 + noise * 0.1), 0.08) + 1;

    const errorRate = clamp(
      (d.errorRate ?? 0) + (overloaded ? (util - 1) * 0.25 : 0) + noise * 0.002,
      0,
      1,
    );
    const p50 = latency * 0.6;
    const p95 = latency * (overloaded ? 1.4 : 1.0);
    const p99 = latency * (overloaded ? 2.2 : 1.8);
    const cpu = clamp((util * 55 + 6 + noise * 6) * (overloaded ? 1.25 : 1), 1, 100);
    const memory = clamp((util * 40 + 12 + noise * 5), 1, 100);

    nodeMetrics[n.id] = {
      rps: Math.round(load),
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      errorRate,
      cpu: Math.round(cpu),
      memory: Math.round(memory),
    };

    cost += nodeMonthlyCost(d.kind, replicas);
    const w = Math.max(1, load);
    traffic += load;
    wLatency += p95 * w;
    wError += errorRate * w;
    wCpu += cpu * w;
    wMem += memory * w;
    weight += w;
  }

  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    const flow = rps.get(e.source) ?? 0;
    const perOut = flow / Math.max(1, (outgoing.get(e.source) ?? []).length);
    edgeMetrics[e.id] = {
      rps: Math.round(perOut),
      latency: Math.round((e.data?.latencyMs ?? 10) + 1),
      errors: 0,
    };
  }

  const telemetry: ArchitectureTelemetry = {
    traffic: Math.round(traffic),
    p95: weight ? Math.round(wLatency / weight) : 0,
    errorRate: weight ? wError / weight : 0,
    cpu: weight ? Math.round(wCpu / weight) : 0,
    memory: weight ? Math.round(wMem / weight) : 0,
    cost,
  };

  return { nodeMetrics, edgeMetrics, telemetry };
}
