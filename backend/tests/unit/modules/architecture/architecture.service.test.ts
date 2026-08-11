/**
 * @file architecture.service.test.ts
 *
 * @description Unit tests for ArchitectureService. Both repositories are mocked,
 * so the tests focus on how DTOs are mapped and how the business rules behave
 * (ownership for writes, project-visibility reads, empty updates, graph
 * merging, pagination).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArchitectureService } from "../../../../src/modules/architecture/architecture.service.js";
import { ArchitectureRepository } from "../../../../src/modules/architecture/architecture.repository.js";
import { ProjectRepository } from "../../../../src/modules/project/project.repository.js";
import { ApiError, NotFoundError } from "../../../../src/lib/index.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";
const ownerId = uuid;
const otherUserId = "6a58bb24-2f9b-4e40-a1c5-4d2d5bce0f91";
const projectId = "7c69bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

type ArchitectureRow = Awaited<ReturnType<ArchitectureRepository["findById"]>>;
type ProjectRow = Awaited<ReturnType<ProjectRepository["findById"]>>;

/** A representative architecture row used as both input and expected output. */
const existingArchitecture: ArchitectureRow = {
  id: uuid,
  projectId,
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

/** A representative project row the architectures belong to. */
const existingProject: ProjectRow = {
  id: projectId,
  ownerId,
  name: "System Lab",
  description: null,
  visibility: "PRIVATE",
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** Mock architecture repository injected into the service under test. */
const archRepo = {
  create: vi.fn(),
  findPaginated: vi.fn(),
  count: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as ArchitectureRepository;

/** Mock project repository used for ownership and visibility lookups. */
const projectRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findPaginatedByOwner: vi.fn(),
  countByOwner: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as ProjectRepository;

const service = new ArchitectureService(archRepo, projectRepo);

const createDto = {
  projectId,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ArchitectureService.create", () => {
  it("requires the caller to own the target project, then maps the dto", async () => {
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);
    vi.mocked(archRepo.create).mockResolvedValue(existingArchitecture);

    const result = await service.create(ownerId, createDto);

    expect(projectRepo.findById).toHaveBeenCalledWith(projectId);
    expect(archRepo.create).toHaveBeenCalledWith({
      projectId,
      name: "Payment Service",
      description: "Handles checkout",
      graph: {
        nodes: createDto.nodes,
        edges: createDto.edges,
      },
    });
    expect(result).toEqual(existingArchitecture);
  });

  it("rejects creating in a project owned by someone else with a 403", async () => {
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const promise = service.create(otherUserId, createDto);
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(archRepo.create).not.toHaveBeenCalled();
  });

  it("propagates NotFoundError when the project does not exist", async () => {
    vi.mocked(projectRepo.findById).mockRejectedValue(NotFoundError());

    const promise = service.create(ownerId, createDto);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(archRepo.create).not.toHaveBeenCalled();
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);
    vi.mocked(archRepo.create).mockRejectedValue(error);

    await expect(service.create(ownerId, createDto)).rejects.toThrow("db down");
  });
});

describe("ArchitectureService.getAllArchitectures", () => {
  it("returns a paginated result scoped to the caller's projects", async () => {
    vi.mocked(archRepo.findPaginated).mockResolvedValue([existingArchitecture]);
    vi.mocked(archRepo.count).mockResolvedValue(5);

    const result = await service.getAllArchitectures(ownerId, {
      page: 2,
      limit: 2,
    });

    expect(archRepo.findPaginated).toHaveBeenCalledWith({
      ownerId,
      projectId: undefined,
      page: 2,
      limit: 2,
    });
    expect(archRepo.count).toHaveBeenCalledWith({
      ownerId,
      projectId: undefined,
    });
    expect(result).toEqual({
      items: [existingArchitecture],
      pagination: { page: 2, limit: 2, total: 5, totalPages: 3 },
    });
  });

  it("forwards an optional projectId filter to the repository", async () => {
    vi.mocked(archRepo.findPaginated).mockResolvedValue([]);
    vi.mocked(archRepo.count).mockResolvedValue(0);

    await service.getAllArchitectures(ownerId, {
      projectId,
      page: 1,
      limit: 20,
    });

    expect(archRepo.findPaginated).toHaveBeenCalledWith({
      ownerId,
      projectId,
      page: 1,
      limit: 20,
    });
    expect(archRepo.count).toHaveBeenCalledWith({
      ownerId,
      projectId,
    });
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(archRepo.findPaginated).mockRejectedValue(error);

    await expect(
      service.getAllArchitectures(ownerId, { page: 1, limit: 20 }),
    ).rejects.toThrow("db down");
  });
});

describe("ArchitectureService.findById", () => {
  it("allows the owner to read an architecture in a PRIVATE project", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const result = await service.findById(uuid, ownerId);

    expect(projectRepo.findById).toHaveBeenCalledWith(projectId);
    expect(result).toEqual(existingArchitecture);
  });

  it("allows anyone to read an architecture in a PUBLIC project", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue({
      ...existingProject,
      visibility: "PUBLIC",
    });

    await expect(service.findById(uuid, otherUserId)).resolves.toEqual(
      existingArchitecture,
    );
  });

  it("allows any authenticated user to read an architecture in an UNLISTED project", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue({
      ...existingProject,
      visibility: "UNLISTED",
    });

    await expect(service.findById(uuid, otherUserId)).resolves.toEqual(
      existingArchitecture,
    );
  });

  it("hides an architecture in a PRIVATE project from a non-owner with a 404", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const promise = service.findById(uuid, otherUserId);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("hides an architecture in a PRIVATE project from an anonymous caller with a 404", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const promise = service.findById(uuid);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("propagates NotFoundError when the architecture does not exist", async () => {
    vi.mocked(archRepo.findById).mockRejectedValue(NotFoundError());

    const promise = service.findById(uuid);
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("propagates NotFoundError when the parent project is missing", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockRejectedValue(NotFoundError());

    await expect(service.findById(uuid, ownerId)).rejects.toMatchObject({
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

    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);
    vi.mocked(archRepo.update).mockResolvedValue({
      ...existingArchitecture,
      graph: { nodes: newNodes, edges: newEdges },
    });

    const result = await service.update(uuid, ownerId, {
      nodes: newNodes,
      edges: newEdges,
    });

    expect(archRepo.update).toHaveBeenCalledWith(uuid, {
      graph: { nodes: newNodes, edges: newEdges },
    });
    expect(archRepo.update).toHaveBeenCalledOnce();
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

    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    await service.update(uuid, ownerId, { nodes: newNodes });

    expect(archRepo.update).toHaveBeenCalledWith(uuid, {
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

    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    await service.update(uuid, ownerId, { edges: newEdges });

    expect(archRepo.update).toHaveBeenCalledWith(uuid, {
      graph: {
        nodes: existingArchitecture.graph.nodes,
        edges: newEdges,
      },
    });
  });

  it("uses an explicitly empty nodes array instead of the existing graph", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    await service.update(uuid, ownerId, { nodes: [] });

    expect(archRepo.update).toHaveBeenCalledWith(uuid, {
      graph: {
        nodes: [],
        edges: existingArchitecture.graph.edges,
      },
    });
  });

  it("does not touch the graph when only name is provided", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    await service.update(uuid, ownerId, { name: "Renamed" });

    expect(archRepo.update).toHaveBeenCalledWith(uuid, { name: "Renamed" });
  });

  it("does not touch the graph when only description is provided", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    await service.update(uuid, ownerId, { description: "New desc" });

    expect(archRepo.update).toHaveBeenCalledWith(uuid, {
      description: "New desc",
    });
  });

  it("never passes a projectId to the repository", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    await service.update(uuid, ownerId, {
      name: "Renamed",
      nodes: [],
      edges: [],
    });

    const args = vi.mocked(archRepo.update).mock.calls[0]![1] as Record<
      string,
      unknown
    >;
    expect("projectId" in args).toBe(false);
  });

  it("rejects updates from a non-owner with a 403 and skips the repository", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const promise = service.update(uuid, otherUserId, { name: "Hijacked" });
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(archRepo.update).not.toHaveBeenCalled();
  });

  it("throws BadRequestError and skips the update for an empty payload", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const promise = service.update(uuid, ownerId, {});
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
    expect(archRepo.update).not.toHaveBeenCalled();
  });

  it("propagates NotFoundError when the architecture does not exist", async () => {
    vi.mocked(archRepo.findById).mockRejectedValue(NotFoundError());

    const promise = service.update(uuid, ownerId, { name: "X" });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(archRepo.update).not.toHaveBeenCalled();
  });

  it("propagates repository update errors", async () => {
    const error = new Error("update failed");
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);
    vi.mocked(archRepo.update).mockRejectedValue(error);

    await expect(
      service.update(uuid, ownerId, { name: "X" }),
    ).rejects.toThrow("update failed");
  });
});

describe("ArchitectureService.delete", () => {
  it("delegates the id to the repository when the caller owns the project", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);
    vi.mocked(archRepo.delete).mockResolvedValue(existingArchitecture);

    const result = await service.delete(uuid, ownerId);

    expect(archRepo.delete).toHaveBeenCalledWith(uuid);
    expect(archRepo.delete).toHaveBeenCalledOnce();
    expect(result).toEqual(existingArchitecture);
  });

  it("rejects deletion from a non-owner with a 403 and skips the repository", async () => {
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);

    const promise = service.delete(uuid, otherUserId);
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(archRepo.delete).not.toHaveBeenCalled();
  });

  it("propagates NotFoundError when the architecture does not exist", async () => {
    vi.mocked(archRepo.findById).mockRejectedValue(NotFoundError());

    const promise = service.delete(uuid, ownerId);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(archRepo.delete).not.toHaveBeenCalled();
  });

  it("propagates repository errors", async () => {
    const error = new Error("delete failed");
    vi.mocked(archRepo.findById).mockResolvedValue(existingArchitecture);
    vi.mocked(projectRepo.findById).mockResolvedValue(existingProject);
    vi.mocked(archRepo.delete).mockRejectedValue(error);

    await expect(service.delete(uuid, ownerId)).rejects.toThrow("delete failed");
  });
});