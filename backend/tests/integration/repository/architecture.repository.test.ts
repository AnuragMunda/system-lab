import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, getTestDatabaseUrl } from "../helpers/db.js";
import { createProject, validArchitecture } from "../helpers/fixtures.js";
import { ArchitectureRepository } from "../../../src/modules/architecture/architecture.repository.js";
import { ApiError } from "../../../src/lib/apiError.js";
import db from "../../../src/infrastructure/database/db.js";
import { scenariosTable } from "../../../src/infrastructure/database/schema/scenarios.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

const repo = new ArchitectureRepository();

describeDb("ArchitectureRepository", () => {
  beforeEach(async () => {
    await resetDb(getTestDatabaseUrl());
  });

  describe("create", () => {
    it("creates a row with a generated id and timestamps", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);

      const created = await repo.create({
        projectId: project.id,
        name: body.name,
        description: body.description,
        graph: { nodes: body.nodes, edges: body.edges },
      });

      expect(created.id).toEqual(expect.any(String));
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(created.projectId).toBe(project.id);
      expect(created.name).toBe(body.name);
    });

    it("round-trips the graph exactly through jsonb", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const graph = { nodes: body.nodes, edges: body.edges };

      const created = await repo.create({
        projectId: project.id,
        name: body.name,
        graph,
      });

      const found = await repo.findById(created.id);
      expect(found.graph).toEqual(graph);
    });

    it("throws ConflictError for a duplicate (projectId, name)", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);

      await repo.create({
        projectId: project.id,
        name: body.name,
        graph: { nodes: [], edges: [] },
      });

      const promise = repo.create({
        projectId: project.id,
        name: body.name,
        graph: { nodes: [], edges: [] },
      });

      await expect(promise).rejects.toBeInstanceOf(ApiError);
      await expect(promise).rejects.toMatchObject({
        statusCode: 409,
        code: "CONFLICT",
      });
    });
  });

  describe("findAll", () => {
    it("returns an empty list when the table is empty", async () => {
      await expect(repo.findAll()).resolves.toEqual([]);
    });

    it("returns all created architectures", async () => {
      const project = await createProject();

      await repo.create({
        projectId: project.id,
        name: "A",
        graph: { nodes: [], edges: [] },
      });
      await repo.create({
        projectId: project.id,
        name: "B",
        graph: { nodes: [], edges: [] },
      });

      const rows = await repo.findAll();
      expect(rows).toHaveLength(2);
      expect(rows.map((r: { name: string }) => r.name).sort()).toEqual(["A", "B"]);
    });
  });

  describe("findById", () => {
    it("returns the matching architecture", async () => {
      const project = await createProject();
      const created = await repo.create({
        projectId: project.id,
        name: "Found",
        graph: { nodes: [], edges: [] },
      });

      const found = await repo.findById(created.id);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Found");
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

  describe("update", () => {
    it("updates fields and bumps updatedAt", async () => {
      const project = await createProject();
      const created = await repo.create({
        projectId: project.id,
        name: "Before",
        description: "old",
        graph: { nodes: [], edges: [] },
      });

      const updated = await repo.update(created.id, {
        name: "After",
        description: "new",
      });

      expect(updated.name).toBe("After");
      expect(updated.description).toBe("new");
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime(),
      );
      expect(updated.createdAt).toEqual(created.createdAt);
    });

    it("updates the graph when provided", async () => {
      const project = await createProject();
      const created = await repo.create({
        projectId: project.id,
        name: "Before",
        graph: { nodes: [], edges: [] },
      });

      const graph = { nodes: validArchitecture(project.id).nodes, edges: [] };

      const updated = await repo.update(created.id, { graph });

      expect(updated.graph).toEqual(graph);
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
    it("deletes the architecture and returns it", async () => {
      const project = await createProject();
      const created = await repo.create({
        projectId: project.id,
        name: "To Delete",
        graph: { nodes: [], edges: [] },
      });

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

    it("cascades deletion to the architecture's scenarios", async () => {
      const project = await createProject();
      const created = await repo.create({
        projectId: project.id,
        name: "To Delete",
        graph: { nodes: [], edges: [] },
      });

      await db.insert(scenariosTable).values({
        architectureId: created.id,
        name: "Traffic Spike",
        events: [],
      });

      await repo.delete(created.id);

      const scenarios = await db.select().from(scenariosTable);
      expect(scenarios).toEqual([]);
    });
  });
});
