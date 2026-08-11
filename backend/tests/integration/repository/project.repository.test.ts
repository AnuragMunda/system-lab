/**
 * @file project.repository.test.ts
 *
 * @description Integration tests for ProjectRepository against a real
 * PostgreSQL test database, covering CRUD, owner-scoped pagination, counts, and
 * the default visibility.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, getTestDatabaseUrl } from "../helpers/db.js";
import { createProjectForUser, createUser } from "../helpers/fixtures.js";
import { ProjectRepository } from "../../../src/modules/project/project.repository.js";
import { ApiError } from "../../../src/lib/apiError.js";
import db from "../../../src/infrastructure/database/db.js";
import { projectsTable } from "../../../src/infrastructure/database/schema/projects.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

const repo = new ProjectRepository();

describeDb("ProjectRepository", () => {
  beforeEach(async () => {
    await resetDb(getTestDatabaseUrl());
  });

  describe("create", () => {
    it("creates a row with a generated id and timestamps", async () => {
      const { user } = await createUser();

      const created = await repo.create({
        ownerId: user.id,
        name: "System Lab",
        description: "Simulation workspace",
        visibility: "PRIVATE",
      });

      expect(created.id).toEqual(expect.any(String));
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(created.ownerId).toBe(user.id);
      expect(created.name).toBe("System Lab");
      expect(created.visibility).toBe("PRIVATE");
    });

    it("stores the given visibility", async () => {
      const { user } = await createUser();

      const created = await repo.create({
        ownerId: user.id,
        name: "Public project",
        visibility: "PUBLIC",
      });

      const found = await repo.findById(created.id);
      expect(found.visibility).toBe("PUBLIC");
    });
  });

  describe("findById", () => {
    it("defaults visibility to PRIVATE when inserted without one", async () => {
      const { user } = await createUser();
      const [project] = await db
        .insert(projectsTable)
        .values({ ownerId: user.id, name: "Defaults to private" })
        .returning();

      const found = await repo.findById(project!.id);

      expect(found.name).toBe("Defaults to private");
      expect(found.visibility).toBe("PRIVATE");
    });

    it("returns the matching project", async () => {
      const { user } = await createUser();
      const created = await createProjectForUser(user.id);

      const found = await repo.findById(created.id);
      expect(found.id).toBe(created.id);
      expect(found.ownerId).toBe(user.id);
    });

    it("throws NotFoundError for a missing id", async () => {
      const promise = repo.findById("5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91");

      await expect(promise).rejects.toBeInstanceOf(ApiError);
      await expect(promise).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });

  describe("findPaginatedByOwner", () => {
    it("returns an empty list when the owner has no projects", async () => {
      const { user } = await createUser();

      const rows = await repo.findPaginatedByOwner({
        ownerId: user.id,
        page: 1,
        limit: 20,
      });
      expect(rows).toEqual([]);
    });

    it("returns only the owner's projects ordered by newest first", async () => {
      const { user } = await createUser();
      await createProjectForUser(user.id, { name: "A" });
      await createProjectForUser(user.id, { name: "B" });

      const rows = await repo.findPaginatedByOwner({
        ownerId: user.id,
        page: 1,
        limit: 20,
      });

      expect(rows).toHaveLength(2);
      expect(rows.map((r: { name: string }) => r.name)).toEqual(["B", "A"]);
    });

    it("does not leak projects owned by other users", async () => {
      const { user: ownerA } = await createUser();
      const { user: ownerB } = await createUser();
      await createProjectForUser(ownerA.id, { name: "A-Project" });
      await createProjectForUser(ownerB.id, { name: "B-Project" });

      const rows = await repo.findPaginatedByOwner({
        ownerId: ownerA.id,
        page: 1,
        limit: 20,
      });

      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe("A-Project");
    });

    it("paginates with limit and offset", async () => {
      const { user } = await createUser();

      for (let i = 0; i < 3; i += 1) {
        await createProjectForUser(user.id, { name: `Project ${i}` });
      }

      const page1 = await repo.findPaginatedByOwner({
        ownerId: user.id,
        page: 1,
        limit: 2,
      });
      expect(page1).toHaveLength(2);

      const page2 = await repo.findPaginatedByOwner({
        ownerId: user.id,
        page: 2,
        limit: 2,
      });
      expect(page2).toHaveLength(1);
    });
  });

  describe("countByOwner", () => {
    it("counts only the owner's projects", async () => {
      const { user: ownerA } = await createUser();
      const { user: ownerB } = await createUser();

      await createProjectForUser(ownerA.id);
      await createProjectForUser(ownerA.id);
      await createProjectForUser(ownerB.id);

      await expect(repo.countByOwner(ownerA.id)).resolves.toBe(2);
      await expect(repo.countByOwner(ownerB.id)).resolves.toBe(1);
    });
  });

  describe("update", () => {
    it("updates fields and bumps updatedAt", async () => {
      const { user } = await createUser();
      const created = await createProjectForUser(user.id, {
        name: "Before",
        description: "old",
      });

      const updated = await repo.update(created.id, {
        name: "After",
        description: "new",
        visibility: "PUBLIC",
      });

      expect(updated.name).toBe("After");
      expect(updated.description).toBe("new");
      expect(updated.visibility).toBe("PUBLIC");
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime(),
      );
      expect(updated.createdAt).toEqual(created.createdAt);
    });

    it("throws NotFoundError for a missing id", async () => {
      const promise = repo.update("5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91", {
        name: "X",
      });

      await expect(promise).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });

  describe("delete", () => {
    it("deletes the project and returns it", async () => {
      const { user } = await createUser();
      const created = await createProjectForUser(user.id, { name: "To Delete" });

      const deleted = await repo.delete(created.id);

      expect(deleted.id).toBe(created.id);
      expect(deleted.name).toBe("To Delete");
      await expect(repo.findById(created.id)).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });

    it("throws NotFoundError for a missing id", async () => {
      const promise = repo.delete("5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91");

      await expect(promise).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });
});