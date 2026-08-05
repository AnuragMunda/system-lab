import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../../src/lib/index.js";

const makeNext = () => vi.fn() as unknown as NextFunction;

describe("asyncHandler", () => {
  it("passes req, res and next through when the handler resolves", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = makeNext();
    const fn = vi.fn(async (r, s, n) => {
      expect(r).toBe(req);
      expect(s).toBe(res);
      expect(n).toBe(next);
    });

    await asyncHandler(fn)(req, res, next);

    expect(fn).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next with the error when the handler rejects", async () => {
    const error = new Error("boom");
    const fn = vi.fn(async () => {
      throw error;
    });
    const next = makeNext();

    const result = asyncHandler(fn)({} as Request, {} as Response, next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
    expect(result).toBeUndefined();
  });

  it("calls next with the error for a synchronous throw", async () => {
    const error = new Error("sync boom");
    const fn = vi.fn(() => {
      throw error;
    });
    const next = makeNext();

    asyncHandler(fn)({} as Request, {} as Response, next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});
