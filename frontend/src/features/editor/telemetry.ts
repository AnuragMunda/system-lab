// Aggregated / baseline telemetry helpers for the editor. Used by the bottom
// telemetry bar when no simulation is running, and to seed cost estimates.
import { nodeMonthlyCost } from "./catalog";
import type { ArchitectureTelemetry, EditorNode } from "./types";

/** Baseline architecture-wide telemetry derived from node configs (no sim running). */
export function computeBaselineTelemetry(nodes: EditorNode[]): ArchitectureTelemetry {
  let cost = 0;
  let traffic = 0;
  let weightedLatency = 0;
  let weightedError = 0;
  let weightedCpu = 0;
  let weightedMemory = 0;
  let weight = 0;

  for (const n of nodes) {
    const d = n.data;
    cost += nodeMonthlyCost(d.kind, d.replicas);
    const rps = d.traffic;
    traffic += rps;
    const w = Math.max(1, rps);
    weightedLatency += d.latencyMs * w;
    weightedError += (d.errorRate ?? 0) * w;
    weightedCpu += d.cpu * w;
    weightedMemory += d.memory * w;
    weight += w;
  }

  return {
    traffic,
    p95: weight ? Math.round(weightedLatency / weight) : 0,
    errorRate: weight ? weightedError / weight : 0,
    cpu: weight ? Math.round(weightedCpu / weight) : 0,
    memory: weight ? Math.round(weightedMemory / weight) : 0,
    cost,
  };
}
