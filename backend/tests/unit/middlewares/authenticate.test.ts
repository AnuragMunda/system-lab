/**
 * @file authenticate.test.ts
 *
 * @description Unit tests for the authenticate middleware: parsing Bearer
 * tokens, populating req.user, and forwarding errors for missing/invalid tokens.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/infrastructure/auth/jwt.js", () => ({
  verifyAccessToken: vi.fn(),
}));

import { authenticate } from "../../../src/middlewares/authenticate.js";
import { verifyAccessToken } from "../../../src/infrastructure/auth/jwt.js";
import { ApiError } from "../../../src/lib/apiError.js";
import type { Request, Response, NextFunction } from "express";

const invalidTokenError = new ApiError(
  "Invalid or expired access token.",
  401,
  "UNAUTHORIZED",
);

/** A Request that carries the optional `user` payload set by the middleware. */
type AuthenticatedRequest = Request & {
  user?: { id: string; email: string; sessionId: string };
};

function makeNext() {
  return vi.fn() as unknown as NextFunction;
}

const mockRes = (() => ({})) as unknown as Response;

describe("authenticate", () => {
  it("passes an UnauthorizedError to next when no Authorization header is present", () => {
    const req = { headers: {} } as Request;
    const next = makeNext();

    authenticate(req, mockRes, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("passes an UnauthorizedError to next for a non-Bearer scheme", () => {
    const req = { headers: { authorization: "Basic abc123" } } as Request;
    const next = makeNext();

    authenticate(req, mockRes, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("sets req.user and calls next for a valid token", () => {
    const payload = {
      sub: "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
      email: "ada@test.local",
      sid: "5e6f7g8h-1111-4e40-a1c5-4d2d5bce0f91",
    };
    vi.mocked(verifyAccessToken).mockReturnValue(payload);

    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as unknown as AuthenticatedRequest;
    const next = makeNext();

    authenticate(req, mockRes, next);

    expect(verifyAccessToken).toHaveBeenCalledWith("valid-token");
    expect(req.user).toEqual({
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards a verification error to next", () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw invalidTokenError;
    });

    const req = {
      headers: { authorization: "Bearer invalid-token" },
    } as unknown as AuthenticatedRequest;
    const next = makeNext();

    authenticate(req, mockRes, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(invalidTokenError);
  });
});
