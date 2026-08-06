/**
 * @file apiResponse.test.ts
 *
 * @description Unit tests for the ApiResponse success envelope helpers,
 * verifying status codes and the shape of the JSON response body.
 */

import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { ApiResponse } from "../../../src/lib/index.js";

/** Creates a minimal fake Express response with mocked status/json. */
function mockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("ApiResponse.success", () => {
  it("includes data when provided", () => {
    const res = mockRes();

    ApiResponse.success(res, 200, { id: 1 }, "Done");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Done",
      data: { id: 1 },
    });
  });

  it("omits the data key when data is null", () => {
    const res = mockRes();

    ApiResponse.success(res, 200, null, "Done");

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Done",
    });
  });

  it("defaults statusCode to 200 and message to Success", () => {
    const res = mockRes();

    ApiResponse.success(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Success",
    });
  });
});

describe("ApiResponse.ok", () => {
  it("responds with 200 and a default message", () => {
    const res = mockRes();

    ApiResponse.ok(res, [1, 2, 3]);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: [1, 2, 3],
    });
  });
});

describe("ApiResponse.created", () => {
  it("responds with 201 and a default message", () => {
    const res = mockRes();

    ApiResponse.created(res, { id: 1 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Resource created successfully",
      data: { id: 1 },
    });
  });
});
