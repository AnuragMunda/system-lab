/**
 * @file architecture.api.test.ts
 *
 * @description Integration tests for the architecture HTTP endpoints, exercised
 * through supertest against the real app and database.
 */

import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../../../src/app.js";
import { resetDb, getTestDatabaseUrl } from "../helpers/db.js";
import { createProject, validArchitecture } from "../helpers/fixtures.js";
import { ArchitectureRepository } from "../../../src/modules/architecture/architecture.repository.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

const repo = new ArchitectureRepository();

describeDb("Architectures API", () => {
  beforeEach(async () => {
    await resetDb(getTestDatabaseUrl());
  });

  describe("POST /api/v1/architectures", () => {
    it("creates an architecture and responds with 201", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Architecture created successfully");
      expect(res.body.data).toMatchObject({
        projectId: project.id,
        name: body.name,
        description: body.description,
        graph: { nodes: body.nodes, edges: body.edges },
      });
      expect(res.body.data.id).toEqual(expect.any(String));
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
    });

    it("persists the architecture so it can be fetched from the repository", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);

      const res = await request(app).post("/api/v1/architectures").send(body);

      const found = await repo.findById(res.body.data.id);
      expect(found.name).toBe(body.name);
      expect(found.description).toBe(body.description);
      expect(found.graph).toEqual({ nodes: body.nodes, edges: body.edges });
    });

    it("rejects a payload missing the name", async () => {
      const project = await createProject();
      const { name: _name, ...body } = validArchitecture(project.id);

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("rejects an empty name", async () => {
      const project = await createProject();
      const body = { ...validArchitecture(project.id), name: "" };

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("rejects an unknown node type", async () => {
      const project = await createProject();
      const valid = validArchitecture(project.id);
      const body = {
        ...valid,
        nodes: [{ ...valid.nodes[0]!, type: "banana" }],
      };

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("rejects a negative component latency", async () => {
      const project = await createProject();
      const valid = validArchitecture(project.id);
      const body = {
        ...valid,
        nodes: [{ ...valid.nodes[1]!, config: { latencyMs: -1 } }],
      };

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("rejects an errorRate above 1", async () => {
      const project = await createProject();
      const valid = validArchitecture(project.id);
      const body = {
        ...valid,
        nodes: [{ ...valid.nodes[1]!, config: { errorRate: 1.5 } }],
      };

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("rejects a null description", async () => {
      const project = await createProject();
      const body = { ...validArchitecture(project.id), description: null };

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 409 for a duplicate (projectId, name)", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);

      await request(app).post("/api/v1/architectures").send(body).expect(201);

      const res = await request(app).post("/api/v1/architectures").send(body);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ success: false, code: "CONFLICT" });
    });
  });

  describe("GET /api/v1/architectures", () => {
    it("returns an empty paginated list when no architectures exist", async () => {
      const res = await request(app).get("/api/v1/architectures");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    });

    it("returns the created architectures with default pagination", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);

      await request(app).post("/api/v1/architectures").send(body).expect(201);

      const res = await request(app).get("/api/v1/architectures");

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0]).toMatchObject({
        projectId: project.id,
        name: body.name,
      });
      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("paginates across pages", async () => {
      const project = await createProject();

      for (let i = 0; i < 3; i += 1) {
        await request(app)
          .post("/api/v1/architectures")
          .send({
            ...validArchitecture(project.id),
            name: `Arch ${i}`,
          })
          .expect(201);
      }

      const page1 = await request(app)
        .get("/api/v1/architectures")
        .query({ page: 1, limit: 2 });

      expect(page1.body.data.items).toHaveLength(2);
      expect(page1.body.data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
      });

      const page2 = await request(app)
        .get("/api/v1/architectures")
        .query({ page: 2, limit: 2 });

      expect(page2.body.data.items).toHaveLength(1);
      expect(page2.body.data.pagination.page).toBe(2);
    });

    it("filters by projectId", async () => {
      const projectA = await createProject();
      const projectB = await createProject();

      await request(app)
        .post("/api/v1/architectures")
        .send({ ...validArchitecture(projectA.id), name: "A-Arch" })
        .expect(201);
      await request(app)
        .post("/api/v1/architectures")
        .send({ ...validArchitecture(projectB.id), name: "B-Arch" })
        .expect(201);

      const res = await request(app)
        .get("/api/v1/architectures")
        .query({ projectId: projectA.id });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe("A-Arch");
      expect(res.body.data.pagination.total).toBe(1);
    });

    it("returns 400 for an invalid projectId", async () => {
      const res = await request(app)
        .get("/api/v1/architectures")
        .query({ projectId: "not-a-uuid" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 400 for invalid pagination query params", async () => {
      const res = await request(app)
        .get("/api/v1/architectures")
        .query({ page: 0, limit: 101 });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });
  });

  describe("PATCH /api/v1/architectures/:id", () => {
    it("updates the name without touching the graph", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const res = await request(app)
        .patch(`/api/v1/architectures/${created.body.data.id}`)
        .send({ name: "Renamed" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Architecture updated successfully");
      expect(res.body.data.name).toBe("Renamed");
      expect(res.body.data.graph).toEqual({ nodes: body.nodes, edges: body.edges });
    });

    it("merges existing nodes when only edges are provided", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const newEdges = [{ id: "e-2", source: "api-1", target: "db-1", config: {} }];

      const res = await request(app)
        .patch(`/api/v1/architectures/${created.body.data.id}`)
        .send({ edges: newEdges });

      expect(res.status).toBe(200);
      expect(res.body.data.graph.nodes).toEqual(body.nodes);
      expect(res.body.data.graph.edges).toEqual(newEdges);
    });

    it("replaces the full graph when both nodes and edges are provided", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const newNodes = [
        { id: "n-1", type: "database", name: "DB", position: { x: 5, y: 5 }, config: {} },
      ];
      const newEdges = [{ id: "e-9", source: "n-1", target: "n-1", config: {} }];

      const res = await request(app)
        .patch(`/api/v1/architectures/${created.body.data.id}`)
        .send({ nodes: newNodes, edges: newEdges });

      expect(res.status).toBe(200);
      expect(res.body.data.graph).toEqual({ nodes: newNodes, edges: newEdges });
    });

    it("ignores a projectId sent in the body", async () => {
      const project = await createProject();
      const otherProject = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const res = await request(app)
        .patch(`/api/v1/architectures/${created.body.data.id}`)
        .send({ projectId: otherProject.id, name: "Renamed" });

      expect(res.status).toBe(200);
      expect(res.body.data.projectId).toBe(project.id);

      const found = await repo.findById(created.body.data.id);
      expect(found.projectId).toBe(project.id);
    });

    it("returns 400 for an empty body", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const res = await request(app)
        .patch(`/api/v1/architectures/${created.body.data.id}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 404 for a valid uuid that does not exist", async () => {
      const res = await request(app)
        .patch("/api/v1/architectures/5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91")
        .send({ name: "Renamed" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });

    it("returns 400 for a non-uuid id", async () => {
      const res = await request(app)
        .patch("/api/v1/architectures/not-a-uuid")
        .send({ name: "Renamed" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 409 when renaming to a conflicting name", async () => {
      const project = await createProject();
      const first = validArchitecture(project.id);
      const second = {
        ...validArchitecture(project.id),
        name: "Second Service",
      };

      const createdFirst = await request(app)
        .post("/api/v1/architectures")
        .send(first)
        .expect(201);
      await request(app).post("/api/v1/architectures").send(second).expect(201);

      const res = await request(app)
        .patch(`/api/v1/architectures/${createdFirst.body.data.id}`)
        .send({ name: "Second Service" });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ success: false, code: "CONFLICT" });
    });
  });

  describe("DELETE /api/v1/architectures/:id", () => {
    it("deletes the architecture and responds with 200", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const res = await request(app).delete(
        `/api/v1/architectures/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Architecture deleted successfully");
      expect(res.body.data.id).toBe(created.body.data.id);

      await expect(repo.findById(created.body.data.id)).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });

    it("returns 400 for a non-uuid id", async () => {
      const res = await request(app).delete(
        "/api/v1/architectures/not-a-uuid",
      );

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 404 for a valid uuid that does not exist", async () => {
      const res = await request(app).delete(
        "/api/v1/architectures/5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
      );

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });
  });

  describe("GET /api/v1/architectures/:id", () => {
    it("returns the architecture", async () => {
      const project = await createProject();
      const body = validArchitecture(project.id);
      const created = await request(app)
        .post("/api/v1/architectures")
        .send(body)
        .expect(201);

      const res = await request(app).get(
        `/api/v1/architectures/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: created.body.data.id,
        projectId: project.id,
        name: body.name,
        graph: { nodes: body.nodes, edges: body.edges },
      });
    });

    it("returns 400 for a non-uuid id", async () => {
      const res = await request(app).get("/api/v1/architectures/not-a-uuid");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 404 for a valid uuid that does not exist", async () => {
      const res = await request(app).get(
        "/api/v1/architectures/5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
      );

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });
  });
});
