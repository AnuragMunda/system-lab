/**
 * @file architecture.controller.test.ts
 *
 * @description Unit tests for the architecture HTTP handlers. The service is
 * mocked so each handler's auth gate, validation, status codes, and error
 * forwarding can be exercised in isolation.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/modules/architecture/index.js", () => ({
  architectureService: {
    create: vi.fn(),
    getAllArchitectures: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const { architectureService } =
  await import("../../../../src/modules/architecture/index.js");
const {
  createArchitecture,
  getAllArchitectures,
  getArchitectureById,
  updateArchitecture,
  deleteArchitecture,
} =
  await import("../../../../src/modules/architecture/architecture.controller.js");
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createArchitecture", () => {
  const validBody = {
    projectId: "7c69bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
    name: "Payment Service",
    nodes: [],
    edges: [],
  };

  it("creates an architecture on behalf of the caller and responds with 201", async () => {
    const req = mockAuthReq({ body: validBody });
    const res = mockRes();
    const next = mockNext();

    const created = { id: uuid, ...validBody };
    vi.mocked(architectureService.create).mockResolvedValue(created as never);

    await createArchitecture(req, res, next);
    await flush();

    expect(architectureService.create).toHaveBeenCalledWith(userId, validBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Architecture created successfully",
      data: created,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = { body: validBody } as Request;
    const res = mockRes();
    const next = mockNext();

    await createArchitecture(req, res, next);
    await flush();

    expect(architectureService.create).not.toHaveBeenCalled();
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
    vi.mocked(architectureService.create).mockRejectedValue(error as never);

    await createArchitecture(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("getAllArchitectures", () => {
  it("responds with 200 and the caller's paginated result using default query values", async () => {
    const req = mockAuthReq({ query: {} });
    const res = mockRes();
    const next = mockNext();

    const result = {
      items: [{ id: uuid, name: "A" }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };
    vi.mocked(architectureService.getAllArchitectures).mockResolvedValue(
      result as never,
    );

    await getAllArchitectures(req, res, next);
    await flush();

    expect(architectureService.getAllArchitectures).toHaveBeenCalledWith(
      userId,
      { page: 1, limit: 20 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: result,
    });
  });

  it("passes the projectId, page and limit query params to the service", async () => {
    const req = mockAuthReq({
      query: { projectId: uuid, page: "2", limit: "10" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(architectureService.getAllArchitectures).mockResolvedValue({
      items: [],
      pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
    } as never);

    await getAllArchitectures(req, res, next);
    await flush();

    expect(architectureService.getAllArchitectures).toHaveBeenCalledWith(
      userId,
      { projectId: uuid, page: 2, limit: 10 },
    );
  });

  it("passes a BadRequestError to next for an invalid query", async () => {
    const req = mockAuthReq({ query: { page: "0" } });
    const res = mockRes();
    const next = mockNext();

    await getAllArchitectures(req, res, next);
    await flush();

    expect(architectureService.getAllArchitectures).not.toHaveBeenCalled();
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

    await getAllArchitectures(req, res, next);
    await flush();

    expect(architectureService.getAllArchitectures).not.toHaveBeenCalled();
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
    vi.mocked(architectureService.getAllArchitectures).mockRejectedValue(
      error as never,
    );

    await getAllArchitectures(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

describe("getArchitectureById", () => {
  it("fetches with the caller's id and responds with 200", async () => {
    const req = mockAuthReq({ params: { id: uuid } });
    const res = mockRes();
    const next = mockNext();

    const found = { id: uuid, name: "Payment Service" };
    vi.mocked(architectureService.findById).mockResolvedValue(found as never);

    await getArchitectureById(req, res, next);
    await flush();

    expect(architectureService.findById).toHaveBeenCalledWith(uuid, userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: found,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("fetches anonymously when no user is present", async () => {
    const req = { params: { id: uuid } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    const found = { id: uuid, name: "Payment Service" };
    vi.mocked(architectureService.findById).mockResolvedValue(found as never);

    await getArchitectureById(req, res, next);
    await flush();

    expect(architectureService.findById).toHaveBeenCalledWith(uuid, undefined);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("passes a BadRequestError to next for an invalid id", async () => {
    const req = mockAuthReq({ params: { id: "not-a-uuid" } });
    const res = mockRes();
    const next = mockNext();

    await getArchitectureById(req, res, next);
    await flush();

    expect(architectureService.findById).not.toHaveBeenCalled();
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
    vi.mocked(architectureService.findById).mockRejectedValue(error as never);

    await getArchitectureById(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

describe("updateArchitecture", () => {
  it("updates an architecture and responds with 200", async () => {
    const req = mockAuthReq({
      params: { id: uuid },
      body: { name: "Renamed" },
    });
    const res = mockRes();
    const next = mockNext();

    const updated = { id: uuid, name: "Renamed" };
    vi.mocked(architectureService.update).mockResolvedValue(updated as never);

    await updateArchitecture(req, res, next);
    await flush();

    expect(architectureService.update).toHaveBeenCalledWith(uuid, userId, {
      name: "Renamed",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Architecture updated successfully",
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

    await updateArchitecture(req, res, next);
    await flush();

    expect(architectureService.update).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
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

    await updateArchitecture(req, res, next);
    await flush();

    expect(architectureService.update).not.toHaveBeenCalled();
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("passes a service error to next", async () => {
    const req = mockAuthReq({
      params: { id: uuid },
      body: { name: "Renamed" },
    });
    const res = mockRes();
    const next = mockNext();

    const error = new Error("update failed");
    vi.mocked(architectureService.update).mockRejectedValue(error as never);

    await updateArchitecture(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});

describe("deleteArchitecture", () => {
  it("deletes an architecture and responds with 200", async () => {
    const req = mockAuthReq({ params: { id: uuid } });
    const res = mockRes();
    const next = mockNext();

    const deleted = { id: uuid, name: "To Delete" };
    vi.mocked(architectureService.delete).mockResolvedValue(deleted as never);

    await deleteArchitecture(req, res, next);
    await flush();

    expect(architectureService.delete).toHaveBeenCalledWith(uuid, userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Architecture deleted successfully",
      data: deleted,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes a BadRequestError to next for an invalid id", async () => {
    const req = mockAuthReq({ params: { id: "not-a-uuid" } });
    const res = mockRes();
    const next = mockNext();

    await deleteArchitecture(req, res, next);
    await flush();

    expect(architectureService.delete).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = { params: { id: uuid } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    await deleteArchitecture(req, res, next);
    await flush();

    expect(architectureService.delete).not.toHaveBeenCalled();
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
    vi.mocked(architectureService.delete).mockRejectedValue(error as never);

    await deleteArchitecture(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});
