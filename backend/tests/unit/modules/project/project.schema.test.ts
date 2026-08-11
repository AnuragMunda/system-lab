/**
 * @file project.schema.test.ts
 *
 * @description Unit tests for the project Zod schemas, covering valid and
 * invalid payloads for create, update, the id param schema, and pagination
 * query params.
 */

import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  idParamSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "../../../../src/modules/project/project.schema.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

/** A fully valid project create payload used as the baseline for tests. */
const validProject = {
  name: "System Lab",
  description: "Architecture simulation workspace",
};

describe("createProjectSchema", () => {
  it("accepts a valid payload and defaults visibility to PRIVATE", () => {
    const result = createProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visibility).toBe("PRIVATE");
    }
  });

  it("accepts an explicit PUBLIC visibility", () => {
    expect(
      createProjectSchema.safeParse({ ...validProject, visibility: "PUBLIC" })
        .success,
    ).toBe(true);
  });

  it("accepts an explicit UNLISTED visibility", () => {
    expect(
      createProjectSchema.safeParse({ ...validProject, visibility: "UNLISTED" })
        .success,
    ).toBe(true);
  });

  it("accepts a missing description", () => {
    expect(
      createProjectSchema.safeParse({ name: "No Description" }).success,
    ).toBe(true);
  });

  it("rejects when name is missing", () => {
    expect(createProjectSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(createProjectSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects a name that exceeds the length limit", () => {
    expect(
      createProjectSchema.safeParse({ name: "x".repeat(151) }).success,
    ).toBe(false);
  });

  it("accepts a name exactly at the length limit", () => {
    expect(
      createProjectSchema.safeParse({ name: "x".repeat(150) }).success,
    ).toBe(true);
  });

  it("rejects an unknown visibility value", () => {
    expect(
      createProjectSchema.safeParse({ ...validProject, visibility: "SECRET" })
        .success,
    ).toBe(false);
  });

  it("rejects a null description", () => {
    expect(
      createProjectSchema.safeParse({ ...validProject, description: null })
        .success,
    ).toBe(false);
  });

  it("strips unknown keys from the parsed result", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      ownerId: "some-owner",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("ownerId" in result.data).toBe(false);
    }
  });
});

describe("updateProjectSchema", () => {
  it("accepts an empty object", () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(true);
  });

  it("accepts only a name", () => {
    expect(updateProjectSchema.safeParse({ name: "Renamed" }).success).toBe(
      true,
    );
  });

  it("accepts only a description", () => {
    expect(
      updateProjectSchema.safeParse({ description: "Updated" }).success,
    ).toBe(true);
  });

  it("accepts only a visibility change", () => {
    expect(
      updateProjectSchema.safeParse({ visibility: "PUBLIC" }).success,
    ).toBe(true);
  });

  it("accepts a combination of fields", () => {
    expect(
      updateProjectSchema.safeParse({
        name: "Renamed",
        visibility: "UNLISTED",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid field value", () => {
    expect(updateProjectSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects an invalid visibility value", () => {
    expect(
      updateProjectSchema.safeParse({ visibility: "SECRET" }).success,
    ).toBe(false);
  });

  it("strips unknown keys such as ownerId from the parsed result", () => {
    const result = updateProjectSchema.safeParse({
      ownerId: "someone-else",
      name: "Renamed",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("ownerId" in result.data).toBe(false);
    }
  });
});

describe("idParamSchema", () => {
  it("accepts a valid uuid", () => {
    expect(idParamSchema.safeParse({ id: uuid }).success).toBe(true);
  });

  it("rejects a non-uuid string", () => {
    expect(idParamSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects a missing id", () => {
    expect(idParamSchema.safeParse({}).success).toBe(false);
  });
});

describe("listProjectsQuerySchema", () => {
  it("defaults page to 1 and limit to 20", () => {
    const result = listProjectsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, limit: 20 });
    }
  });

  it("coerces string page and limit values", () => {
    const result = listProjectsQuerySchema.safeParse({
      page: "2",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 2, limit: 50 });
    }
  });

  it("rejects a page below 1", () => {
    expect(listProjectsQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects a limit below 1", () => {
    expect(listProjectsQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects a limit above 100", () => {
    expect(listProjectsQuerySchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
  });

  it("rejects a non-integer page", () => {
    expect(listProjectsQuerySchema.safeParse({ page: 1.5 }).success).toBe(
      false,
    );
  });
});
