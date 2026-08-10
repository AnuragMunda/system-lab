/**
 * @file auth.controller.test.ts
 *
 * @description Unit tests for the auth HTTP handlers. The auth service and
 * cookie helpers are mocked so each handler's validation, cookie handling,
 * status codes, and error forwarding can be exercised in isolation.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/modules/auth/index.js", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

vi.mock("@/infrastructure/auth/cookies.js", () => ({
  setRefreshTokenCookie: vi.fn(),
  clearRefreshTokenCookie: vi.fn(),
}));

const { authService } = await import("../../../../src/modules/auth/index.js");
const { setRefreshTokenCookie, clearRefreshTokenCookie } =
  await import("../../../../src/infrastructure/auth/cookies.js");
const { registerUser, login, refresh, logout, logoutAll, me } =
  await import("../../../../src/modules/auth/auth.controller.js");
import { ApiError, UnauthorizedError } from "../../../../src/lib/apiError.js";

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

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

/** Waits for the microtask queue so async handler promises settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const registeredUser = {
  id: uuid,
  name: "Ada Lovelace",
  email: "ada@test.local",
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerUser", () => {
  const validBody = {
    name: "Ada Lovelace",
    email: "ada@test.local",
    password: "supersecret1",
  };

  it("registers a user and responds with 201", async () => {
    const req = { body: validBody } as Request;
    const res = mockRes();
    const next = mockNext();

    vi.mocked(authService.register).mockResolvedValue(registeredUser as never);

    await registerUser(req, res, next);
    await flush();

    expect(authService.register).toHaveBeenCalledWith(validBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User registered successfully.",
      data: registeredUser,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes a BadRequestError to next for an invalid body", async () => {
    const req = { body: { name: "", email: "nope", password: "x" } } as Request;
    const res = mockRes();
    const next = mockNext();

    await registerUser(req, res, next);
    await flush();

    expect(authService.register).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });
});

describe("login", () => {
  const validBody = {
    email: "ada@test.local",
    password: "supersecret1",
  };

  it("sets the refresh cookie and responds with 200 on success", async () => {
    const req = { body: validBody } as Request;
    const res = mockRes();
    const next = mockNext();

    const authResponse = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: registeredUser,
    };
    vi.mocked(authService.login).mockResolvedValue(authResponse as never);

    await login(req, res, next);
    await flush();

    expect(authService.login).toHaveBeenCalledWith(validBody);
    expect(setRefreshTokenCookie).toHaveBeenCalledWith(res, "refresh-token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logged in successfully.",
      data: { accessToken: "access-token", user: registeredUser },
    });
  });

  it("passes a BadRequestError to next for an invalid body", async () => {
    const req = { body: { email: "not-an-email" } } as Request;
    const res = mockRes();
    const next = mockNext();

    await login(req, res, next);
    await flush();

    expect(authService.login).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("forwards an auth service error to next", async () => {
    const req = { body: validBody } as Request;
    const res = mockRes();
    const next = mockNext();

    const error = UnauthorizedError("Invalid email or password");
    vi.mocked(authService.login).mockRejectedValue(error as never);

    await login(req, res, next);
    await flush();

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
    expect(setRefreshTokenCookie).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("refresh", () => {
  it("passes an UnauthorizedError to next when the cookie is missing", async () => {
    const req = { cookies: {} } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    await refresh(req, res, next);
    await flush();

    expect(authService.refresh).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      message: "Refresh token required.",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("rotates the refresh cookie and responds with the new access token", async () => {
    const req = {
      cookies: { refreshToken: "old-refresh-token" },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    vi.mocked(authService.refresh).mockResolvedValue({
      accessToken: "new-access-token",
      newRefreshToken: "new-refresh-token",
    } as never);

    await refresh(req, res, next);
    await flush();

    expect(authService.refresh).toHaveBeenCalledWith("old-refresh-token");
    expect(setRefreshTokenCookie).toHaveBeenCalledWith(
      res,
      "new-refresh-token",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: { accessToken: "new-access-token" },
    });
  });
});

describe("logout", () => {
  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = {} as Request;
    const res = mockRes();
    const next = mockNext();

    await logout(req, res, next);
    await flush();

    expect(authService.logout).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("revokes the current session and clears the refresh cookie", async () => {
    const req = {
      user: { id: uuid, email: "ada@test.local", sessionId: uuid },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    vi.mocked(authService.logout).mockResolvedValue(undefined as never);

    await logout(req, res, next);
    await flush();

    expect(authService.logout).toHaveBeenCalledWith(uuid);
    expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Logged out successfully.",
      }),
    );
  });
});

describe("logoutAll", () => {
  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = {} as Request;
    const res = mockRes();
    const next = mockNext();

    await logoutAll(req, res, next);
    await flush();

    expect(authService.logoutAll).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("revokes all sessions for the user and clears the refresh cookie", async () => {
    const req = {
      user: { id: uuid, email: "ada@test.local", sessionId: uuid },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    vi.mocked(authService.logoutAll).mockResolvedValue(undefined as never);

    await logoutAll(req, res, next);
    await flush();

    expect(authService.logoutAll).toHaveBeenCalledWith(uuid);
    expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Logged out from all devices.",
      }),
    );
  });
});

describe("me", () => {
  it("passes an UnauthorizedError to next when there is no user", async () => {
    const req = {} as Request;
    const res = mockRes();
    const next = mockNext();

    await me(req, res, next);
    await flush();

    expect(authService.getCurrentUser).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as Mock).mock.calls[0]![0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("responds with the current user", async () => {
    const req = {
      user: { id: uuid, email: "ada@test.local", sessionId: uuid },
    } as unknown as Request;
    const res = mockRes();
    const next = mockNext();

    vi.mocked(authService.getCurrentUser).mockResolvedValue(
      registeredUser as never,
    );

    await me(req, res, next);
    await flush();

    expect(authService.getCurrentUser).toHaveBeenCalledWith(uuid);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Request successful",
      data: registeredUser,
    });
  });
});
