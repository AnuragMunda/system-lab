import db from "../../../src/infrastructure/database/db.js";
import { usersTable } from "../../../src/infrastructure/database/schema/users.js";
import { projectsTable } from "../../../src/infrastructure/database/schema/projects.js";

let counter = 0;

export async function createProject() {
  counter += 1;

  const [user] = await db
    .insert(usersTable)
    .values({
      name: `Owner ${counter}`,
      email: `owner-${counter}-${Date.now()}@test.local`,
      password_hash: "hashed-password",
    })
    .returning();

  const [project] = await db
    .insert(projectsTable)
    .values({
      ownerId: user!.id,
      name: `Project ${counter}`,
    })
    .returning();

  return project!;
}

export function validArchitecture(projectId: string) {
  return {
    projectId,
    name: "Payment Service",
    description: "Handles checkout flows",
    nodes: [
      {
        id: "client-1",
        type: "client" as const,
        name: "Web Client",
        position: { x: 0, y: 0 },
        config: {},
      },
      {
        id: "api-1",
        type: "api" as const,
        name: "API Gateway",
        position: { x: 100, y: 50 },
        config: { latencyMs: 10, capacity: 1000, errorRate: 0.01 },
      },
    ],
    edges: [
      {
        id: "e-1",
        source: "client-1",
        target: "api-1",
        config: { latencyMs: 5, bandwidthMbps: 100, packetLossRate: 0.001 },
      },
    ],
  };
}
