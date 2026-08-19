// Mock AI Architect client. Implements a clean seam (AiClient interface) so a real
// LLM backend can be dropped in later. The mock derives explanations and
// bottleneck/suggestion text from the graph and returns optional "proposals" — new
// components the panel can add to the canvas — so its actions have visible effects.
import type { EditorEdge, EditorNode } from "./types";

export interface AiContext {
  name: string;
  nodes: EditorNode[];
  edges: EditorEdge[];
}

export interface AiProposal {
  kind: EditorNode["data"]["kind"];
  label: string;
  nearId?: string;
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
  proposals?: AiProposal[];
}

export interface AiResponse {
  content: string;
  proposals?: AiProposal[];
}

export interface AiClient {
  explain(ctx: AiContext): Promise<AiResponse>;
  bottlenecks(ctx: AiContext): Promise<AiResponse>;
  suggestions(ctx: AiContext): Promise<AiResponse>;
  generate(ctx: AiContext, prompt: string): Promise<AiResponse>;
  modify(ctx: AiContext, instruction: string): Promise<AiResponse>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function describeTopology(ctx: AiContext): string {
  const byKind = new Map<string, number>();
  for (const n of ctx.nodes) byKind.set(n.data.kind, (byKind.get(n.data.kind) ?? 0) + 1);
  const parts = [...byKind.entries()].map(([k, c]) => `${c}× ${k}`);
  return parts.length ? parts.join(", ") : "no components yet";
}

export class MockAiClient implements AiClient {
  async explain(ctx: AiContext): Promise<AiResponse> {
    await delay(400);
    const lines = [
      `**${ctx.name}** contains ${ctx.nodes.length} components (${describeTopology(ctx)}) connected by ${ctx.edges.length} links.`,
      "",
      ctx.nodes.length === 0
        ? "Start by dragging a Client and a Service from the palette, then connect them."
        : "Traffic enters from client/entry nodes and flows along connections. Each component's health, latency and error rate are simulated when you press Run Simulation.",
    ];
    return { content: lines.join("\n") };
  }

  async bottlenecks(ctx: AiContext): Promise<AiResponse> {
    await delay(500);
    const hot = ctx.nodes
      .filter((n) => n.data.latencyMs > 80 || (n.data.replicas < 2 && n.data.traffic > 500))
      .map((n) => `- **${n.data.label}** (${n.data.kind}) — p95 ≈ ${n.data.latencyMs}ms, ${n.data.replicas} replica(s)`);
    const content = hot.length
      ? `Potential bottlenecks:\n${hot.join("\n")}`
      : "No obvious bottlenecks detected. Latency and replica counts look healthy.";
    return { content };
  }

  async suggestions(ctx: AiContext): Promise<AiResponse> {
    await delay(450);
    const hasCache = ctx.nodes.some((n) => n.data.kind === "redis" || n.data.kind === "cache");
    const hasQueue = ctx.nodes.some(
      (n) => n.data.kind === "kafka" || n.data.kind === "queue" || n.data.kind === "rabbitmq",
    );
    const tips: string[] = [];
    if (!hasCache) tips.push("- Add a **Redis** cache in front of your database to cut read latency.");
    if (!hasQueue) tips.push("- Introduce a **Kafka** topic to decouple producers from slow consumers.");
    tips.push("- Enable autoscaling on stateless Services to absorb traffic spikes.");
    tips.push("- Set a retry policy with a circuit breaker on downstream calls.");
    return { content: `Suggestions:\n${tips.join("\n")}` };
  }

  async generate(ctx: AiContext, prompt: string): Promise<AiResponse> {
    await delay(600);
    const p = prompt.toLowerCase();
    const proposals: AiProposal[] = [];
    const near = ctx.nodes[ctx.nodes.length - 1]?.id;
    if (p.includes("cache") || p.includes("redis")) {
      proposals.push({ kind: "redis", label: "Redis Cache", nearId: near });
    }
    if (p.includes("queue") || p.includes("kafka") || p.includes("event")) {
      proposals.push({ kind: "kafka", label: "Kafka Topic", nearId: near });
    }
    if (p.includes("db") || p.includes("database") || p.includes("postgres")) {
      proposals.push({ kind: "postgresql", label: "PostgreSQL", nearId: near });
    }
    if (proposals.length === 0) {
      proposals.push({ kind: "redis", label: "Redis Cache", nearId: near });
      proposals.push({ kind: "kafka", label: "Kafka Topic", nearId: near });
    }
    return {
      content: `Generated ${proposals.length} component(s) based on "${prompt}". Review and add them to the canvas.`,
      proposals,
    };
  }

  async modify(ctx: AiContext, instruction: string): Promise<AiResponse> {
    await delay(550);
    const p = instruction.toLowerCase();
    const proposals: AiProposal[] = [];
    const near = ctx.nodes[ctx.nodes.length - 1]?.id;
    if (p.includes("cache")) proposals.push({ kind: "redis", label: "Redis Cache", nearId: near });
    if (p.includes("queue") || p.includes("async")) proposals.push({ kind: "kafka", label: "Kafka Topic", nearId: near });
    if (p.includes("cdn")) proposals.push({ kind: "cdn", label: "CDN", nearId: near });
    return {
      content: proposals.length
        ? `Proposed changes for "${instruction}". Add the component(s) below.`
        : `I can modify the architecture for "${instruction}". Try asking to "add a cache" or "add a queue".`,
      proposals,
    };
  }
}

export const aiClient: AiClient = new MockAiClient();
