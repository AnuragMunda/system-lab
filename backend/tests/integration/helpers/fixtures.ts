/**
 * @file fixtures.ts
 *
 * @description Shared fixtures for integration tests: helpers to seed a user +
 * project in the database and build valid architecture payloads.
 */

import db from "../../../src/infrastructure/database/db.js";
import { usersTable } from "../../../src/infrastructure/database/schema/users.js";
import { projectsTable } from "../../../src/infrastructure/database/schema/projects.js";
import { hashData } from "../../../src/infrastructure/auth/bcrypt.js";

let counter = 0;

/** A test user alongside the plaintext password used to create it. */
export interface TestUser {
  user: typeof usersTable.$inferSelect;
  password: string;
}

/**
 * Creates and returns a user whose password is known, so login flows can be
 * exercised through the real API.
 */
export async function createUser(): Promise<TestUser> {
  counter += 1;

  const password = "password123";
  const [user] = await db
    .insert(usersTable)
    .values({
      name: `User ${counter}`,
      email: `user-${counter}-${Date.now()}@test.local`,
      passwordHash: await hashData(password),
    })
    .returning();

  return { user: user!, password };
}

/** Creates and returns a project (with an owning user) in the test database. */
export async function createProject() {
  counter += 1;

  const [user] = await db
    .insert(usersTable)
    .values({
      name: `Owner ${counter}`,
      email: `owner-${counter}-${Date.now()}@test.local`,
      passwordHash: "hashed-password",
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

/** Creates and returns a project owned by the given user id. */
export async function createProjectForUser(
  ownerId: string,
  overrides: Partial<typeof projectsTable.$inferInsert> = {},
) {
  counter += 1;

  const [project] = await db
    .insert(projectsTable)
    .values({ ownerId, name: `Project ${counter}`, ...overrides })
    .returning();

  return project!;
}

/** Returns a valid architecture create payload scoped to the given project. */
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
