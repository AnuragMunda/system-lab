import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/modules/architecture/index.js", () => ({
  architectureService: {
    create: vi.fn(),
    getAllArchitectures: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const { architectureService } = await import(
  "../../../../src/modules/architecture/index.js"
);
const {
  createArchitecture,
  getAllArchitectures,
  updateArchitecture,
  deleteArchitecture,
} = await import("../../../../src/modules/architecture/architecture.controller.js");
import { ApiError } from "../../../../src/lib/index.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function mockNext() {
  return vi.fn() as unknown as NextFunction;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createArchitecture", () => {
  const validBody = {
    projectId: "p-1",
    name: "Payment Service",
    nodes: [
      { id: "c-1", type: "client", name: "Client", position: { x: 0, y: 0 }, config: {} },
    ],
    edges: [],
  };

  it("creates an architecture and responds with 201", async () => {
    const req = { body: validBody } as Request;
    const res = mockRes();
    const next = mockNext();

    const created = { id: uuid, ...validBody };
    vi.mocked(architectureService.create).mockResolvedValue(created as never);

    await createArchitecture(req, res, next);
    await flush();

    expect(architectureService.create).toHaveBeenCalledWith(validBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Architecture created successfully",
      data: created,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes a BadRequestError to next for an invalid body", async () => {
    const req = { body: { name: "" } } as Request;
    const res = mockRes();
    const next = mockNext();

    await createArchitecture(req, res, next);
    await flush();

    expect(architectureService.create).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("passes a service error to next", async () => {
    const req = { body: validBody } as Request;
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
  it("responds with 200 and the list of architectures", async () => {
    const req = {} as Request;
    const res = mockRes();
    const next = mockNext();

    const list = [{ id: uuid, name: "A" }];
    vi.mocked(architectureService.getAllArchitectures).mockResolvedValue(
      list as never,
    );

    await getAllArchitectures(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: list,
    });
  });

  it("passes a service error to next", async () => {
    const req = {} as Request;
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

describe("updateArchitecture", () => {
  it("updates an architecture and responds with 200", async () => {
    const req = {
      params: { id: uuid },
      body: { name: "Renamed" },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    const updated = { id: uuid, name: "Renamed" };
    vi.mocked(architectureService.update).mockResolvedValue(updated as never);

    await updateArchitecture(req, res, next);
    await flush();

    expect(architectureService.update).toHaveBeenCalledWith(uuid, {
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
    const req = {
      params: { id: "not-a-uuid" },
      body: { name: "Renamed" },
    } as unknown as Request;
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

  it("passes a BadRequestError to next for an invalid body", async () => {
    const req = {
      params: { id: uuid },
      body: { name: "" },
    } as unknown as Request;
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

  it("strips projectId before calling the service", async () => {
    const req = {
      params: { id: uuid },
      body: { projectId: "p-999", name: "Renamed" },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    await updateArchitecture(req, res, next);
    await flush();

    expect(architectureService.update).toHaveBeenCalledWith(uuid, {
      name: "Renamed",
    });
  });

  it("passes a service error to next", async () => {
    const req = {
      params: { id: uuid },
      body: { name: "Renamed" },
    } as unknown as Request;
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
    const req = { params: { id: uuid } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    const deleted = { id: uuid, name: "To Delete" };
    vi.mocked(architectureService.delete).mockResolvedValue(deleted as never);

    await deleteArchitecture(req, res, next);
    await flush();

    expect(architectureService.delete).toHaveBeenCalledWith(uuid);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Architecture deleted successfully",
      data: deleted,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes a BadRequestError to next for an invalid id", async () => {
    const req = { params: { id: "not-a-uuid" } } as unknown as Request;
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

  it("passes a service error to next", async () => {
    const req = { params: { id: uuid } } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    const error = new Error("delete failed");
    vi.mocked(architectureService.delete).mockRejectedValue(error as never);

    await deleteArchitecture(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});
