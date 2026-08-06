/**
 * @file architecture.service.test.ts
 *
 * @description Unit tests for ArchitectureService. The repository is mocked, so
 * the tests focus on how DTOs are mapped and how business rules (empty updates,
 * graph merging, pagination) behave.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArchitectureService } from "../../../../src/modules/architecture/architecture.service.js";
import { ArchitectureRepository } from "../../../../src/modules/architecture/architecture.repository.js";
import { ApiError, NotFoundError } from "../../../../src/lib/index.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

type ArchitectureRow = Awaited<ReturnType<ArchitectureRepository["findById"]>>;

/** A representative architecture row used as both input and expected output. */
const existingArchitecture: ArchitectureRow = {
  id: uuid,
  projectId: "p-1",
  name: "Old Name",
  description: "Old description",
  graph: {
    nodes: [
      {
        id: "api-1",
        type: "api",
        name: "API",
        position: { x: 0, y: 0 },
        config: {},
      },
    ],
    edges: [{ id: "e-1", source: "api-1", target: "db-1", config: {} }],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** Mock repository injected into the service under test. */
const repo = {
  create: vi.fn(),
  findPaginated: vi.fn(),
  count: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as ArchitectureRepository;

const service = new ArchitectureService(repo);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ArchitectureService.create", () => {
  it("maps the dto to a record and delegates to the repository", async () => {
    const dto = {
      projectId: "p-1",
      name: "Payment Service",
      description: "Handles checkout",
      nodes: [
        {
          id: "api-1",
          type: "api" as const,
          name: "API",
          position: { x: 0, y: 0 },
          config: {},
        },
      ],
      edges: [{ id: "e-1", source: "api-1", target: "db-1", config: {} }],
    };

    vi.mocked(repo.create).mockResolvedValue(existingArchitecture);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith({
      projectId: "p-1",
      name: "Payment Service",
      description: "Handles checkout",
      graph: {
        nodes: [
          {
            id: "api-1",
            type: "api",
            name: "API",
            position: { x: 0, y: 0 },
            config: {},
          },
        ],
        edges: [{ id: "e-1", source: "api-1", target: "db-1", config: {} }],
      },
    });
    expect(result).toEqual(existingArchitecture);
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(repo.create).mockRejectedValue(error);

    await expect(
      service.create({
        projectId: "p-1",
        name: "X",
        nodes: [],
        edges: [],
      }),
    ).rejects.toThrow("db down");
  });
});

describe("ArchitectureService.getAllArchitectures", () => {
  it("returns a paginated result built from findPaginated and count", async () => {
    vi.mocked(repo.findPaginated).mockResolvedValue([existingArchitecture]);
    vi.mocked(repo.count).mockResolvedValue(5);

    const result = await service.getAllArchitectures({
      page: 2,
      limit: 2,
    });

    expect(repo.findPaginated).toHaveBeenCalledWith({
      projectId: undefined,
      page: 2,
      limit: 2,
    });
    expect(repo.count).toHaveBeenCalledWith({ projectId: undefined });
    expect(result).toEqual({
      items: [existingArchitecture],
      pagination: { page: 2, limit: 2, total: 5, totalPages: 3 },
    });
  });

  it("forwards an optional projectId filter to the repository", async () => {
    vi.mocked(repo.findPaginated).mockResolvedValue([]);
    vi.mocked(repo.count).mockResolvedValue(0);

    await service.getAllArchitectures({
      projectId: "p-1",
      page: 1,
      limit: 20,
    });

    expect(repo.findPaginated).toHaveBeenCalledWith({
      projectId: "p-1",
      page: 1,
      limit: 20,
    });
    expect(repo.count).toHaveBeenCalledWith({ projectId: "p-1" });
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(repo.findPaginated).mockRejectedValue(error);

    await expect(service.getAllArchitectures({ page: 1, limit: 20 })).rejects.toThrow(
      "db down",
    );
  });
});

describe("ArchitectureService.findById", () => {
  it("delegates the id to the repository", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    const result = await service.findById(uuid);

    expect(repo.findById).toHaveBeenCalledWith(uuid);
    expect(repo.findById).toHaveBeenCalledOnce();
    expect(result).toEqual(existingArchitecture);
  });

  it("propagates NotFoundError when the architecture does not exist", async () => {
    vi.mocked(repo.findById).mockRejectedValue(NotFoundError());

    const promise = service.findById(uuid);
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });
});

describe("ArchitectureService.update", () => {
  it("replaces the full graph when both nodes and edges are provided", async () => {
    const newNodes = [
      {
        id: "n-1",
        type: "client" as const,
        name: "Client",
        position: { x: 1, y: 2 },
        config: {},
      },
    ];
    const newEdges = [
      { id: "e-9", source: "n-1", target: "api-1", config: {} },
    ];

    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(repo.update).mockResolvedValue({
      ...existingArchitecture,
      graph: { nodes: newNodes, edges: newEdges },
    });

    const result = await service.update(uuid, {
      nodes: newNodes,
      edges: newEdges,
    });

    expect(repo.update).toHaveBeenCalledWith(uuid, {
      graph: { nodes: newNodes, edges: newEdges },
    });
    expect(repo.update).toHaveBeenCalledOnce();
    expect(result.graph).toEqual({ nodes: newNodes, edges: newEdges });
  });

  it("merges existing edges when only nodes are provided", async () => {
    const newNodes = [
      {
        id: "n-2",
        type: "cache" as const,
        name: "Redis",
        position: { x: 3, y: 4 },
        config: {},
      },
    ];

    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    await service.update(uuid, { nodes: newNodes });

    expect(repo.update).toHaveBeenCalledWith(uuid, {
      graph: {
        nodes: newNodes,
        edges: existingArchitecture.graph.edges,
      },
    });
  });

  it("merges existing nodes when only edges are provided", async () => {
    const newEdges = [
      { id: "e-2", source: "api-1", target: "db-1", config: {} },
    ];

    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    await service.update(uuid, { edges: newEdges });

    expect(repo.update).toHaveBeenCalledWith(uuid, {
      graph: {
        nodes: existingArchitecture.graph.nodes,
        edges: newEdges,
      },
    });
  });

  it("uses an explicitly empty nodes array instead of the existing graph", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    await service.update(uuid, { nodes: [] });

    expect(repo.update).toHaveBeenCalledWith(uuid, {
      graph: {
        nodes: [],
        edges: existingArchitecture.graph.edges,
      },
    });
  });

  it("does not touch the graph when only name is provided", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    await service.update(uuid, { name: "Renamed" });

    expect(repo.update).toHaveBeenCalledWith(uuid, { name: "Renamed" });
  });

  it("does not touch the graph when only description is provided", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    await service.update(uuid, { description: "New desc" });

    expect(repo.update).toHaveBeenCalledWith(uuid, { description: "New desc" });
  });

  it("never passes a projectId to the repository", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    await service.update(uuid, { name: "Renamed", nodes: [], edges: [] });

    const args = vi.mocked(repo.update).mock.calls[0]![1] as Record<
      string,
      unknown
    >;
    expect("projectId" in args).toBe(false);
  });

  it("throws BadRequestError and skips the update for an empty payload", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);

    const promise = service.update(uuid, {});
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("propagates NotFoundError when the architecture does not exist", async () => {
    vi.mocked(repo.findById).mockRejectedValue(NotFoundError());

    const promise = service.update(uuid, { name: "X" });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("propagates repository update errors", async () => {
    const error = new Error("update failed");
    vi.mocked(repo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(repo.update).mockRejectedValue(error);

    await expect(service.update(uuid, { name: "X" })).rejects.toThrow(
      "update failed",
    );
  });
});

describe("ArchitectureService.delete", () => {
  it("delegates the id to the repository", async () => {
    vi.mocked(repo.delete).mockResolvedValue(existingArchitecture);

    const result = await service.delete(uuid);

    expect(repo.delete).toHaveBeenCalledWith(uuid);
    expect(repo.delete).toHaveBeenCalledOnce();
    expect(result).toEqual(existingArchitecture);
  });

  it("propagates repository errors", async () => {
    const error = new Error("delete failed");
    vi.mocked(repo.delete).mockRejectedValue(error);

    await expect(service.delete(uuid)).rejects.toThrow("delete failed");
  });
});
