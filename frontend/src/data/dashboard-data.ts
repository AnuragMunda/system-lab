// Mock/seed data for the dashboard: projects, experiments, activity feed, and templates.
// Shapes: Project, ExperimentStatus/Experiment, ActivityKind/ActivityItem,
// and Template. Each exported array is the sample dataset consumed by the dashboard widgets.
import type { Health } from "@/lib/health";

// Project visibility — mirrors the backend enum (lowercased for the UI).
export type ProjectVisibility = "private" | "unlisted" | "public";

// A dashboard project: identity, description, health, architectures, and headline metrics.
// `activityRank` is a display-only ordinal (1 = most recent) used to sort by last activity.
export interface Project {
  id: string;
  name: string;
  description: string;
  health: Health;
  architectures: string[];
  componentCount: number;
  simulationCount: number;
  experimentCount: number;
  owner: string;
  lastActivity: string;
  activityRank: number;
  visibility: ProjectVisibility;
}

// Projects are now fetched dynamically from the backend (see store/projectsSlice);
// the `Project` type below is the dashboard view model the cards render.

export type ExperimentStatus = "passed" | "failed" | "running";

// A single experiment run: what was tested, its scenario/result, and outcome status.
interface Experiment {
  id: string;
  name: string;
  project: string;
  scenario: string;
  result: string;
  duration: string;
  date: string;
  status: ExperimentStatus;
}

// Seed list of recent experiments rendered by ExperimentTimeline.
export const recentExperiments: Experiment[] = [
  {
    id: "exp-01",
    name: "Black Friday Traffic Spike",
    project: "E-Commerce Platform",
    scenario: "10x request burst, 60s ramp",
    result: "p99 latency held at 210ms",
    duration: "4m 12s",
    date: "Today, 14:32",
    status: "passed",
  },
  {
    id: "exp-02",
    name: "Cache Node Eviction",
    project: "Payments Ledger",
    scenario: "Kill 2 of 3 Redis replicas",
    result: "Cascading timeout in Orders Service",
    duration: "2m 48s",
    date: "Today, 11:07",
    status: "failed",
  },
  {
    id: "exp-03",
    name: "Cross-Region Failover",
    project: "Realtime Chat Mesh",
    scenario: "Drop us-east-1 for 90s",
    result: "Reconnected in 3.2s, zero drops",
    duration: "5m 30s",
    date: "Yesterday, 19:45",
    status: "passed",
  },
  {
    id: "exp-04",
    name: "Queue Backpressure",
    project: "Video Transcode Pipeline",
    scenario: "Producer rate 4x consumer",
    result: "In progress \u2014 monitoring lag",
    duration: "1m 05s",
    date: "Yesterday, 09:12",
    status: "running",
  },
  {
    id: "exp-05",
    name: "Database Failover Drill",
    project: "Ride Dispatch Engine",
    scenario: "Primary DB restart mid-load",
    result: "Read replica promoted in 1.8s",
    duration: "3m 21s",
    date: "3d ago, 16:20",
    status: "passed",
  },
];

export type ActivityKind =
  | "architecture-created"
  | "simulation-completed"
  | "scenario-executed"
  | "collaborator-joined"
  | "ai-recommendation";

// A single entry in the lab activity feed: kind, title, detail, and timestamp.
interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string;
}

// Seed activity feed rendered by ActivityPanel.
export const labActivity: ActivityItem[] = [
  {
    id: "act-01",
    kind: "ai-recommendation",
    title: "AI recommendation accepted",
    detail: "Added a read replica to Payments Ledger",
    timestamp: "12m ago",
  },
  {
    id: "act-02",
    kind: "simulation-completed",
    title: "Simulation completed",
    detail: "Black Friday Traffic Spike \u2014 passed",
    timestamp: "38m ago",
  },
  {
    id: "act-03",
    kind: "collaborator-joined",
    title: "Collaborator joined",
    detail: "maria.dev joined Realtime Chat Mesh",
    timestamp: "1h ago",
  },
  {
    id: "act-04",
    kind: "scenario-executed",
    title: "Scenario executed",
    detail: "Cache Node Eviction on Payments Ledger",
    timestamp: "3h ago",
  },
  {
    id: "act-05",
    kind: "architecture-created",
    title: "Architecture created",
    detail: "Event-Driven Inventory, 9 nodes",
    timestamp: "1d ago",
  },
  {
    id: "act-06",
    kind: "simulation-completed",
    title: "Simulation completed",
    detail: "Cross-Region Failover \u2014 passed",
    timestamp: "1d ago",
  },
];

// A starter template: category, size, complexity tier, and technology stack tags.
export interface Template {
  id: string;
  name: string;
  category: string;
  nodeCount: number;
  complexity: "Beginner" | "Intermediate" | "Advanced";
  stack: string[];
}

// Seed list of templates rendered by ExploreTemplates / TemplateCard.
export const templates: Template[] = [
  {
    id: "url-shortener",
    name: "URL Shortener",
    category: "Web Service",
    nodeCount: 5,
    complexity: "Beginner",
    stack: ["Gateway", "KV Store", "Analytics Queue"],
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    category: "Retail",
    nodeCount: 12,
    complexity: "Advanced",
    stack: ["Gateway", "Catalog", "Cart", "Payments"],
  },
  {
    id: "social-network",
    name: "Social Network",
    category: "Consumer",
    nodeCount: 14,
    complexity: "Advanced",
    stack: ["Feed Service", "Graph DB", "Media CDN"],
  },
  {
    id: "chat-application",
    name: "Chat Application",
    category: "Realtime",
    nodeCount: 8,
    complexity: "Intermediate",
    stack: ["WebSocket Gateway", "Presence", "Message Store"],
  },
  {
    id: "video-streaming",
    name: "Video Streaming",
    category: "Media",
    nodeCount: 11,
    complexity: "Advanced",
    stack: ["Ingest", "Transcoder", "CDN Edge"],
  },
  {
    id: "ride-sharing",
    name: "Ride Sharing",
    category: "Marketplace",
    nodeCount: 13,
    complexity: "Advanced",
    stack: ["Dispatch", "Geo Index", "Pricing Engine"],
  },
  {
    id: "event-driven-system",
    name: "Event Driven System",
    category: "Infrastructure",
    nodeCount: 7,
    complexity: "Intermediate",
    stack: ["Event Bus", "Consumers", "Dead Letter Queue"],
  },
];
