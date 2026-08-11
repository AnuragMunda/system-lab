/**
 * @file project.controller.test.ts
 *
 * @description Unit tests for the project HTTP handlers. The service is mocked
 * so each handler's auth gate, validation, status codes, and error forwarding
 * can be exercised in isolation.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/modules/project/index.js", () => ({
  projectService: {
    create: vi.fn(),
    getPaginated: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const { projectService } = await import("../../../../src/modules/project/index.js");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = await import("../../../../src/modules/project/project.controller.js");
import { ApiError } from "../../../../src/lib/index.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";
const userId = uuid;

/** Returns a fake Express response with chainable status/json mocks. */
function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

/** Returns a mocked Express next function. */
function mockNext() {
  return vi.fn() as unknown as NextFunction;
}

/** Returns an authenticated request carrying the fixture user. */
function mockAuthReq(partial: Partial<Request> = {}): Request {
  return {
    user: { id: userId, email: "owner@test.local", sessionId: uuid },
    ...partial,
  } as unknown as Request;
}

/** Waits for the microtask queue so async handler promises settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const createdProject = {
  id: uuid,
  ownerId: userId,
  name: "System Lab",
  visibility: "PRIVATE",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createProject", () => {
  const validBody = { name: "System Lab", visibility: "PRIVATE" };

  it("creates a project owned by the caller and responds with 201", async () => {
    const req = mockAuthReq({ body: validBody });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(projectService.create).mockResolvedValue(createdProject as never);

    await createProject(req, res, next);
    await flush();

    expect(projectService.create).toHaveBeenCalledWith(userId, validBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Project created successfully",
      data: createdProject,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = { body: validBody } as Request;
    const res = mockRes();
    const next = mockNext();

    await createProject(req, res, next);
    await flush();

    expect(projectService.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("passes a service error to next", async () => {
    const req = mockAuthReq({ body: validBody });
    const res = mockRes();
    const next = mockNext();

    const error = new Error("db down");
    vi.mocked(projectService.create).mockRejectedValue(error as never);

    await createProject(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("getProjects", () => {
  it("responds with 200 and the caller's paginated projects using default query values", async () => {
    const req = mockAuthReq({ query: {} });
    const res = mockRes();
    const next = mockNext();

    const result = {
      items: [createdProject],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };
    vi.mocked(projectService.getPaginated).mockResolvedValue(result as never);

    await getProjects(req, res, next);
    await flush();

    expect(projectService.getPaginated).toHaveBeenCalledWith(userId, {
      page: 1,
      limit: 20,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: result,
    });
  });

  it("forwards page and limit query params to the service", async () => {
    const req = mockAuthReq({
      query: { page: "2", limit: "10" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(projectService.getPaginated).mockResolvedValue({
      items: [],
      pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
    } as never);

    await getProjects(req, res, next);
    await flush();

    expect(projectService.getPaginated).toHaveBeenCalledWith(userId, {
      page: 2,
      limit: 10,
    });
  });

  it("passes a BadRequestError to next for an invalid query", async () => {
    const req = mockAuthReq({ query: { page: "0" } });
    const res = mockRes();
    const next = mockNext();

    await getProjects(req, res, next);
    await flush();

    expect(projectService.getPaginated).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = { query: {} } as Request;
    const res = mockRes();
    const next = mockNext();

    await getProjects(req, res, next);
    await flush();

    expect(projectService.getPaginated).not.toHaveBeenCalled();
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("passes a service error to next", async () => {
    const req = mockAuthReq({ query: {} });
    const res = mockRes();
    const next = mockNext();

    const error = new Error("db down");
    vi.mocked(projectService.getPaginated).mockRejectedValue(error as never);

    await getProjects(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

describe("getProjectById", () => {
  it("fetches with the caller's id and responds with 200", async () => {
    const req = mockAuthReq({ params: { id: uuid } });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(projectService.findById).mockResolvedValue(createdProject as never);

    await getProjectById(req, res, next);
    await flush();

    expect(projectService.findById).toHaveBeenCalledWith(uuid, userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: createdProject,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("fetches anonymously when no user is present", async () => {
    const req = { params: { id: uuid } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    vi.mocked(projectService.findById).mockResolvedValue(createdProject as never);

    await getProjectById(req, res, next);
    await flush();

    expect(projectService.findById).toHaveBeenCalledWith(uuid, undefined);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("passes a BadRequestError to next for an invalid id", async () => {
    const req = mockAuthReq({ params: { id: "not-a-uuid" } });
    const res = mockRes();
    const next = mockNext();

    await getProjectById(req, res, next);
    await flush();

    expect(projectService.findById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("passes a service error to next", async () => {
    const req = mockAuthReq({ params: { id: uuid } });
    const res = mockRes();
    const next = mockNext();

    const error = new Error("db down");
    vi.mocked(projectService.findById).mockRejectedValue(error as never);

    await getProjectById(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

describe("updateProject", () => {
  it("updates a project and responds with 200", async () => {
    const req = mockAuthReq({ params: { id: uuid }, body: { name: "Renamed" } });
    const res = mockRes();
    const next = mockNext();

    const updated = { ...createdProject, name: "Renamed" };
    vi.mocked(projectService.update).mockResolvedValue(updated as never);

    await updateProject(req, res, next);
    await flush();

    expect(projectService.update).toHaveBeenCalledWith(uuid, userId, {
      name: "Renamed",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes a BadRequestError to next for an invalid id", async () => {
    const req = mockAuthReq({
      params: { id: "not-a-uuid" },
      body: { name: "Renamed" },
    });
    const res = mockRes();
    const next = mockNext();

    await updateProject(req, res, next);
    await flush();

    expect(projectService.update).not.toHaveBeenCalled();
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = {
      params: { id: uuid },
      body: { name: "Renamed" },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    await updateProject(req, res, next);
    await flush();

    expect(projectService.update).not.toHaveBeenCalled();
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("passes a service error to next", async () => {
    const req = mockAuthReq({ params: { id: uuid }, body: { name: "Renamed" } });
    const res = mockRes();
    const next = mockNext();

    const error = new Error("update failed");
    vi.mocked(projectService.update).mockRejectedValue(error as never);

    await updateProject(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

describe("deleteProject", () => {
  it("deletes a project and responds with 200", async () => {
    const req = mockAuthReq({ params: { id: uuid } });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(projectService.delete).mockResolvedValue(createdProject as never);

    await deleteProject(req, res, next);
    await flush();

    expect(projectService.delete).toHaveBeenCalledWith(uuid, userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Project deleted successfully",
      data: createdProject,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes a BadRequestError to next for an invalid id", async () => {
    const req = mockAuthReq({ params: { id: "not-a-uuid" } });
    const res = mockRes();
    const next = mockNext();

    await deleteProject(req, res, next);
    await flush();

    expect(projectService.delete).not.toHaveBeenCalled();
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = { params: { id: uuid } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    await deleteProject(req, res, next);
    await flush();

    expect(projectService.delete).not.toHaveBeenCalled();
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("passes a service error to next", async () => {
    const req = mockAuthReq({ params: { id: uuid } });
    const res = mockRes();
    const next = mockNext();

    const error = new Error("delete failed");
    vi.mocked(projectService.delete).mockRejectedValue(error as never);

    await deleteProject(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});