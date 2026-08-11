/**
 * @file project.service.test.ts
 *
 * @description Unit tests for ProjectService. The repository is mocked, so the
 * tests focus on how records are mapped and how the authorization rules behave:
 * owner-scoped writes and visibility-aware reads (PRIVATE hides from non-owners
 * with a 404).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectService } from "../../../../src/modules/project/project.service.js";
import { ProjectRepository } from "../../../../src/modules/project/project.repository.js";
import { ApiError, NotFoundError } from "../../../../src/lib/index.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";
const ownerId = uuid;
const otherUserId = "6a58bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

type ProjectRow = Awaited<ReturnType<ProjectRepository["findById"]>>;

/** A representative project row used as both input and expected output. */
const existingProject: ProjectRow = {
  id: uuid,
  ownerId,
  name: "System Lab",
  description: "Simulation workspace",
  visibility: "PRIVATE",
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** Mock repository injected into the service under test. */
const repo = {
  create: vi.fn(),
  findById: vi.fn(),
  findPaginatedByOwner: vi.fn(),
  countByOwner: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as ProjectRepository;

const service = new ProjectService(repo);

const createDto = {
  name: "System Lab",
  description: "Simulation workspace",
  visibility: "PRIVATE" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProjectService.create", () => {
  it("stamps the owner id and maps the dto to a repository record", async () => {
    vi.mocked(repo.create).mockResolvedValue(existingProject);

    const result = await service.create(ownerId, createDto);

    expect(repo.create).toHaveBeenCalledWith({
      ownerId,
      name: createDto.name,
      description: createDto.description,
      visibility: createDto.visibility,
    });
    expect(result).toEqual(existingProject);
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(repo.create).mockRejectedValue(error);

    await expect(service.create(ownerId, createDto)).rejects.toThrow("db down");
  });
});

describe("ProjectService.getPaginated", () => {
  it("builds a paginated result from findPaginatedByOwner and countByOwner", async () => {
    vi.mocked(repo.findPaginatedByOwner).mockResolvedValue([existingProject]);
    vi.mocked(repo.countByOwner).mockResolvedValue(5);

    const result = await service.getPaginated(ownerId, {
      page: 2,
      limit: 2,
    });

    expect(repo.findPaginatedByOwner).toHaveBeenCalledWith({
      ownerId,
      page: 2,
      limit: 2,
    });
    expect(repo.countByOwner).toHaveBeenCalledWith(ownerId);
    expect(result).toEqual({
      items: [existingProject],
      pagination: { page: 2, limit: 2, total: 5, totalPages: 3 },
    });
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(repo.findPaginatedByOwner).mockRejectedValue(error);

    await expect(
      service.getPaginated(ownerId, { page: 1, limit: 20 }),
    ).rejects.toThrow("db down");
  });
});

describe("ProjectService.findById", () => {
  it("allows the owner to read a PRIVATE project", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);

    const result = await service.findById(uuid, ownerId);

    expect(repo.findById).toHaveBeenCalledWith(uuid);
    expect(result).toEqual(existingProject);
  });

  it("allows anyone to read a PUBLIC project", async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      ...existingProject,
      visibility: "PUBLIC",
    });

    await expect(service.findById(uuid, otherUserId)).resolves.toMatchObject({
      visibility: "PUBLIC",
    });
  });

  it("allows any authenticated user to read an UNLISTED project", async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      ...existingProject,
      visibility: "UNLISTED",
    });

    await expect(service.findById(uuid, otherUserId)).resolves.toMatchObject({
      visibility: "UNLISTED",
    });
  });

  it("hides a PRIVATE project from a non-owner with a 404", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);

    await expect(service.findById(uuid, otherUserId)).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("hides a PRIVATE project from an anonymous caller with a 404", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);

    await expect(service.findById(uuid)).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("propagates NotFoundError when the project does not exist", async () => {
    vi.mocked(repo.findById).mockRejectedValue(NotFoundError());

    const promise = service.findById(uuid);
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });
});

describe("ProjectService.update", () => {
  it("delegates fields to the repository when the caller is the owner", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);
    vi.mocked(repo.update).mockResolvedValue({
      ...existingProject,
      name: "Renamed",
    });

    const result = await service.update(uuid, ownerId, {
      name: "Renamed",
      visibility: "PUBLIC",
    });

    expect(repo.update).toHaveBeenCalledWith(uuid, {
      name: "Renamed",
      visibility: "PUBLIC",
    });
    expect(repo.update).toHaveBeenCalledOnce();
    expect(result.name).toBe("Renamed");
  });

  it("rejects updates from a non-owner with a 403 and skips the repository", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);

    const promise = service.update(uuid, otherUserId, { name: "Renamed" });
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws BadRequestError and skips the update for an empty payload", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);

    const promise = service.update(uuid, ownerId, {});
    await expect(promise).rejects.toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("propagates NotFoundError when the project does not exist", async () => {
    vi.mocked(repo.findById).mockRejectedValue(NotFoundError());

    const promise = service.update(uuid, ownerId, { name: "X" });
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("propagates repository update errors", async () => {
    const error = new Error("update failed");
    vi.mocked(repo.findById).mockResolvedValue(existingProject);
    vi.mocked(repo.update).mockRejectedValue(error);

    await expect(
      service.update(uuid, ownerId, { name: "X" }),
    ).rejects.toThrow("update failed");
  });
});

describe("ProjectService.delete", () => {
  it("delegates the id to the repository when the caller is the owner", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);
    vi.mocked(repo.delete).mockResolvedValue(existingProject);

    const result = await service.delete(uuid, ownerId);

    expect(repo.delete).toHaveBeenCalledWith(uuid);
    expect(repo.delete).toHaveBeenCalledOnce();
    expect(result).toEqual(existingProject);
  });

  it("rejects deletion from a non-owner with a 403 and skips the repository", async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingProject);

    const promise = service.delete(uuid, otherUserId);
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("propagates NotFoundError when the project does not exist", async () => {
    vi.mocked(repo.findById).mockRejectedValue(NotFoundError());

    const promise = service.delete(uuid, ownerId);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("propagates repository delete errors", async () => {
    const error = new Error("delete failed");
    vi.mocked(repo.findById).mockResolvedValue(existingProject);
    vi.mocked(repo.delete).mockRejectedValue(error);

    await expect(service.delete(uuid, ownerId)).rejects.toThrow("delete failed");
  });
});