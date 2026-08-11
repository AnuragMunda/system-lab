/**
 * @file project.api.test.ts
 *
 * @description Integration tests for the project HTTP endpoints, exercised
 * through supertest against the real app and database: CRUD, ownership rules
 * for writes, and the visibility read matrix (PRIVATE owner-only, UNLISTED and
 * PUBLIC readable by anyone).
 */

import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../../../src/app.js";
import { resetDb, getTestDatabaseUrl } from "../helpers/db.js";
import { createUser, validArchitecture } from "../helpers/fixtures.js";
import { ProjectRepository } from "../../../src/modules/project/project.repository.js";
import { ArchitectureRepository } from "../../../src/modules/architecture/architecture.repository.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

const projectRepo = new ProjectRepository();
const architectureRepo = new ArchitectureRepository();

/** Authenticated fixture user plus the access token used to act as them. */
interface AuthenticatedUser {
  id: string;
  accessToken: string;
}

/** Creates a user and logs them in, returning their identity and access token. */
async function createAuthenticatedUser(): Promise<AuthenticatedUser> {
  const { user, password } = await createUser();
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: user.email, password });
  return { id: user.id, accessToken: res.body.data.accessToken as string };
}

/** The auth header used on authenticated requests. */
function authHeader(token: string) {
  return ["Authorization", `Bearer ${token}`] as const;
}

/** Creates a project through the API as the given user. */
function createProjectAs(user: AuthenticatedUser, body: object = {}) {
  return request(app)
    .post("/api/v1/projects")
    .set(...authHeader(user.accessToken))
    .send({ name: "System Lab", ...body });
}

describeDb("Projects API", () => {
  beforeEach(async () => {
    await resetDb(getTestDatabaseUrl());
  });

  describe("POST /api/v1/projects", () => {
    it("creates a project owned by the caller with PRIVATE visibility", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .post("/api/v1/projects")
        .set(...authHeader(owner.accessToken))
        .send({ name: "System Lab", description: "Workspace" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Project created successfully");
      expect(res.body.data).toMatchObject({
        ownerId: owner.id,
        name: "System Lab",
        description: "Workspace",
        visibility: "PRIVATE",
      });
      expect(res.body.data.id).toEqual(expect.any(String));
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
    });

    it("accepts an explicit PUBLIC visibility", async () => {
      const owner = await createAuthenticatedUser();

      const res = await createProjectAs(owner, { visibility: "PUBLIC" });

      expect(res.status).toBe(201);
      expect(res.body.data.visibility).toBe("PUBLIC");
    });

    it("persists the project so it can be fetched from the repository", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner, { name: "Persisted" });

      const found = await projectRepo.findById(created.body.data.id);
      expect(found.ownerId).toBe(owner.id);
      expect(found.name).toBe("Persisted");
      expect(found.visibility).toBe("PRIVATE");
    });

    it("rejects an empty body", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .post("/api/v1/projects")
        .set(...authHeader(owner.accessToken))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("rejects an invalid visibility", async () => {
      const owner = await createAuthenticatedUser();

      const res = await createProjectAs(owner, { visibility: "SECRET" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 401 without an access token", async () => {
      const res = await request(app)
        .post("/api/v1/projects")
        .send({ name: "System Lab" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });
  });

  describe("GET /api/v1/projects", () => {
    it("returns only the caller's projects, newest first", async () => {
      const owner = await createAuthenticatedUser();
      const other = await createAuthenticatedUser();

      await createProjectAs(owner, { name: "Owner Project" });
      await createProjectAs(other, { name: "Other Project" });

      const res = await request(app)
        .get("/api/v1/projects")
        .set(...authHeader(owner.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0]).toMatchObject({
        name: "Owner Project",
        ownerId: owner.id,
      });
      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("paginates across pages", async () => {
      const owner = await createAuthenticatedUser();

      for (let i = 0; i < 3; i += 1) {
        await createProjectAs(owner, { name: `Project ${i}` }).expect(201);
      }

      const page1 = await request(app)
        .get("/api/v1/projects")
        .set(...authHeader(owner.accessToken))
        .query({ page: 1, limit: 2 });

      expect(page1.body.data.items).toHaveLength(2);
      expect(page1.body.data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
      });

      const page2 = await request(app)
        .get("/api/v1/projects")
        .set(...authHeader(owner.accessToken))
        .query({ page: 2, limit: 2 });

      expect(page2.body.data.items).toHaveLength(1);
      expect(page2.body.data.pagination.page).toBe(2);
    });

    it("returns 401 without an access token", async () => {
      const res = await request(app).get("/api/v1/projects");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });

    it("returns 400 for invalid pagination query params", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .get("/api/v1/projects")
        .set(...authHeader(owner.accessToken))
        .query({ page: 0, limit: 101 });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });
  });

  describe("GET /api/v1/projects/:id visibility matrix", () => {
    it("allows the owner to read a PRIVATE project", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .get(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(owner.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(created.body.data.id);
    });

    it("hides a PRIVATE project from another authenticated user", async () => {
      const owner = await createAuthenticatedUser();
      const other = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .get(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(other.accessToken));

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });

    it("hides a PRIVATE project from an anonymous caller", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app).get(
        `/api/v1/projects/${created.body.data.id}`,
      );

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });

    it("allows an anonymous caller to read an UNLISTED project", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner, {
        visibility: "UNLISTED",
      }).expect(201);

      const res = await request(app).get(
        `/api/v1/projects/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.visibility).toBe("UNLISTED");
    });

    it("allows another authenticated user to read an UNLISTED project", async () => {
      const owner = await createAuthenticatedUser();
      const other = await createAuthenticatedUser();
      const created = await createProjectAs(owner, {
        visibility: "UNLISTED",
      }).expect(201);

      const res = await request(app)
        .get(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(other.accessToken));

      expect(res.status).toBe(200);
    });

    it("allows an anonymous caller to read a PUBLIC project", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner, {
        visibility: "PUBLIC",
      }).expect(201);

      const res = await request(app).get(
        `/api/v1/projects/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.visibility).toBe("PUBLIC");
    });

    it("allows another authenticated user to read a PUBLIC project", async () => {
      const owner = await createAuthenticatedUser();
      const other = await createAuthenticatedUser();
      const created = await createProjectAs(owner, {
        visibility: "PUBLIC",
      }).expect(201);

      const res = await request(app)
        .get(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(other.accessToken));

      expect(res.status).toBe(200);
    });

    it("returns 400 for a non-uuid id", async () => {
      const res = await request(app).get("/api/v1/projects/not-a-uuid");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 404 for a valid uuid that does not exist", async () => {
      const res = await request(app).get(
        "/api/v1/projects/5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
      );

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });
  });

  describe("PATCH /api/v1/projects/:id", () => {
    it("lets the owner update fields and visibility", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .patch(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(owner.accessToken))
        .send({ name: "Renamed", visibility: "PUBLIC" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Project updated successfully");
      expect(res.body.data.name).toBe("Renamed");
      expect(res.body.data.visibility).toBe("PUBLIC");
    });

    it("rejects updates from a non-owner", async () => {
      const owner = await createAuthenticatedUser();
      const other = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .patch(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(other.accessToken))
        .send({ name: "Hijacked" });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ success: false, code: "FORBIDDEN" });
    });

    it("returns 400 for an empty body", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .patch(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(owner.accessToken))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 400 for a non-uuid id", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .patch("/api/v1/projects/not-a-uuid")
        .set(...authHeader(owner.accessToken))
        .send({ name: "Renamed" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 404 for a valid uuid that does not exist", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .patch("/api/v1/projects/5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91")
        .set(...authHeader(owner.accessToken))
        .send({ name: "Renamed" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });

    it("returns 401 without an access token", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .patch(`/api/v1/projects/${created.body.data.id}`)
        .send({ name: "Renamed" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });
  });

  describe("DELETE /api/v1/projects/:id", () => {
    it("lets the owner delete the project and cascades to its architectures", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const arch = await request(app)
        .post("/api/v1/architectures")
        .set(...authHeader(owner.accessToken))
        .send(validArchitecture(created.body.data.id))
        .expect(201);

      const res = await request(app)
        .delete(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(owner.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Project deleted successfully");
      expect(res.body.data.id).toBe(created.body.data.id);

      await expect(
        projectRepo.findById(created.body.data.id),
      ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
      await expect(
        architectureRepo.findById(arch.body.data.id),
      ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    });

    it("rejects deletion from a non-owner", async () => {
      const owner = await createAuthenticatedUser();
      const other = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app)
        .delete(`/api/v1/projects/${created.body.data.id}`)
        .set(...authHeader(other.accessToken));

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ success: false, code: "FORBIDDEN" });
    });

    it("returns 400 for a non-uuid id", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .delete("/api/v1/projects/not-a-uuid")
        .set(...authHeader(owner.accessToken));

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });

    it("returns 404 for a valid uuid that does not exist", async () => {
      const owner = await createAuthenticatedUser();

      const res = await request(app)
        .delete("/api/v1/projects/5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91")
        .set(...authHeader(owner.accessToken));

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
    });

    it("returns 401 without an access token", async () => {
      const owner = await createAuthenticatedUser();
      const created = await createProjectAs(owner).expect(201);

      const res = await request(app).delete(
        `/api/v1/projects/${created.body.data.id}`,
      );

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });
  });
});
