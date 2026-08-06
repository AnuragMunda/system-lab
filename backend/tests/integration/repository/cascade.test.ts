/**
 * @file cascade.test.ts
 *
 * @description Integration tests for foreign-key cascade behavior: deleting a
 * parent row (user/project) cascades to its children (projects/architectures).
 */

import { describe, it, expect, beforeEach } from "vitest";
import db from "../../../src/infrastructure/database/db.js";
import { usersTable } from "../../../src/infrastructure/database/schema/users.js";
import { projectsTable } from "../../../src/infrastructure/database/schema/projects.js";
import { architecturesTable } from "../../../src/infrastructure/database/schema/architectures.js";
import { eq } from "drizzle-orm";
import { resetDb, getTestDatabaseUrl } from "../helpers/db.js";
import { ArchitectureRepository } from "../../../src/modules/architecture/architecture.repository.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

const repo = new ArchitectureRepository();

describeDb("FK cascade behavior", () => {
  beforeEach(async () => {
    await resetDb(getTestDatabaseUrl());
  });

  it("deleting a user cascades to their projects and architectures", async () => {
    const [user] = await db
      .insert(usersTable)
      .values({
        name: "Owner",
        email: `cascade-${Date.now()}@test.local`,
        password_hash: "hashed-password",
      })
      .returning();

    const [project] = await db
      .insert(projectsTable)
      .values({ ownerId: user!.id, name: "Project" })
      .returning();

    await repo.create({
      projectId: project!.id,
      name: "Architecture",
      graph: { nodes: [], edges: [] },
    });

    await db.delete(usersTable).where(eq(usersTable.id, user!.id));

    const projects = await db.select().from(projectsTable);
    const architectures = await db.select().from(architecturesTable);

    expect(projects).toEqual([]);
    expect(architectures).toEqual([]);
  });

  it("deleting a project cascades only to its own architectures", async () => {
    const [user] = await db
      .insert(usersTable)
      .values({
        name: "Owner",
        email: `cascade-${Date.now()}@test.local`,
        password_hash: "hashed-password",
      })
      .returning();

    const [projectA] = await db
      .insert(projectsTable)
      .values({ ownerId: user!.id, name: "Project A" })
      .returning();
    const [projectB] = await db
      .insert(projectsTable)
      .values({ ownerId: user!.id, name: "Project B" })
      .returning();

    await repo.create({
      projectId: projectA!.id,
      name: "A-Arch",
      graph: { nodes: [], edges: [] },
    });
    const b = await repo.create({
      projectId: projectB!.id,
      name: "B-Arch",
      graph: { nodes: [], edges: [] },
    });

    await db.delete(projectsTable).where(eq(projectsTable.id, projectA!.id));

    const remaining = await db.select().from(architecturesTable);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.id).toBe(b.id);
    expect(remaining[0]!.name).toBe("B-Arch");
  });
});
