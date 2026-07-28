# SystemLab - A Distributed Systems Laboratory

> Build. Simulate. Break. Learn.

## Product Definition

> SystemLab is an interactive distributed systems laboratory that lets engineers build architectures, simulate real-world behavior, inject failures, and understand system tradeoffs through visualization instead of memorization.

A browser app where users draw distributed architectures then simulate traffic,
failures, latency, autoscaling, queues, caches and databases. Includes metrics dashboards, chaos
engineering, cost estimation and replay.

Instead of explaining distributed systems...

Let users experience them.

The product transforms architecture from a static diagram into a living simulation where every request, failure, and scaling decision has visible consequences.

### Problem statement

> Engineers can draw distributed systems but cannot easily observe, experiment with, or understand their runtime behavior under realistic traffic, failures, and scaling scenarios.

1. Today people learn system design by:
   - reading blogs
   - watching YouTube videos
   - drawing boxes on Excalidraw
   - memorizing interview patterns

   None of them answer:

   > "What actually happens when 500,000 users hit my API?"

   or

   > "What if Redis dies?"

   or

   > "Should I put Kafka here?"

2. Cloud architecture has hidden costs.

   Developers rarely understand:
   - cost
   - latency
   - scaling
   - availability

   Simulator shows all four simultaneously.

## Target Users

- Software Engineers / System Architect
  - Understand distributed systems
  - Experiment safely
  - Validate architecture ideas
  - Learn Technologies like Kafka, Redis, Load Balancer
- Interview Candidates / Students
  - Practice system design
  - visualize architecture
  - Test scaling ideas
  - Learn concepts (Networking, databases, caching, distributed systems)
- Educators
  - Teach back-end architecture interactively

## System Design and Architecture

### **Backend Architecture Pattern**

#### **Modular Monolith**

> Modular monolith for the product backend + separate simulation workers + infrastructure services

#### Why modular monolith?

Current team size is **one developer**.

At this stage, the biggest risk isn’t that your backend can't handle enough traffic. The biggest risk is **architectural complexity slowing down development**.

I prefer a **modular monolith** because this product will eventually have many domains. A modular monolith lets you maintain clear boundaries.

#### Separate the simulation workload from the API process

The API should **never run long simulations directly**. The backend remains one cohesive application from a domain perspective, while computationally intensive work can scale independently.

### High-Level Architecture

```
                         ┌────────────────────────┐
                         │       Next.js          │
                         │  Web App + UI + Canvas │
                         └───────────┬────────────┘
                                     │
                              HTTP / WebSocket
                                     │
                         ┌───────────▼────────────┐
                         │   Fastify Backend      │
                         │   Modular Monolith     │
                         │                        │
                         │ ┌────────────────────┐ │
                         │ │ Architecture       │ │
                         │ │ Simulation         │ │
                         │ │ Scenarios          │ │
                         │ │ Metrics            │ │
                         │ │ Collaboration      │ │
                         │ │ AI                 │ │
                         │ │ Auth               │ │
                         │ │ Projects           │ │
                         │ └────────────────────┘ │
                         └──────┬───────────┬─────┘
                                │           │
                         PostgreSQL       Redis
                                │           │
                                │      Queue / PubSub
                                │           │
                                │    ┌──────▼───────┐
                                │    │ Simulation   │
                                │    │   Workers    │
                                │    └──────┬───────┘
                                │           │
                                │    Simulation Engine
                                │           │
                                └───────────┘
```

## Tech Stack

| **Layer**           | **Technologies and Tools**                                                       |
| ------------------- | -------------------------------------------------------------------------------- |
| Frontend            | React, Next.js, TypeScript                                                       |
| Canvas              | React Flow or Tldraw SDK                                                         |
| State management    | Zustand or Redux toolkit                                                         |
| Physics & Animation | Framer Motion or React Spring                                                    |
| Backend             | Node.js (Express)                                                                |
| Real-time           | WebSockets or Socket.IO                                                          |
| Simulation          | TypeScript (shared with backend) or Rust compiled to WebAssembly for performance |
| Database            | PostgreSQL                                                                       |
| Cache               | Redis                                                                            |
| Background Jobs     | BullMQ                                                                           |
| AI                  | OpenAI or local models via MCP                                                   |
| Deployment          | Docker, Kubernetes, AWS                                                          |

## Roadmap

| **Phase** | **Goal**                  | **Key Features**                                                                                                        |
| --------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **MVP**   | Design & basic simulation | Canvas, components, graph model, request flow, metrics, save/load                                                       |
| **V1**    | Realistic system behavior | Component logic, dashboards, replay, scenario builder, chaos testing                                                    |
| **V2**    | AI-assisted architecture  | AI generation, reviews, optimization, interview mode, cost estimation                                                   |
| **V3**    | Team collaboration        | Real-time editing, comments, architecture versioning, voice/video, presentation mode                                    |
| **V4**    | Production platform       | Kubernetes/Terraform import-export, production telemetry replay, plugin SDK, enterprise features, deployment automation |
