/**
 * @file auth.controller.ts
 *
 * @description HTTP handlers for the auth module. Each handler parses input,
 * delegates to the singleton AuthService, and shapes the ApiResponse envelope.
 * Handlers behind `authenticate` use the `req.user` payload populated by the
 * middleware.
 */

import { asyncHandler } from "@/lib/asyncHandler.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { BadRequestError, UnauthorizedError } from "@/lib/apiError.js";
import { type Request, type Response } from "express";
import { authService } from "./index.js";
import { ApiResponse } from "@/lib/apiResponse.js";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/infrastructure/auth/cookies.js";

/** Registers a new user and responds with 201 Created. */
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { success, error, data } = registerSchema.safeParse(req.body);

    if (!success) {
      throw BadRequestError(error.message);
    }

    const response = await authService.register(data);

    return ApiResponse.created(res, response, "User registered successfully.");
  },
);

/** Authenticates a user and sets the refresh token as an HttpOnly cookie. */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { success, error, data } = loginSchema.safeParse(req.body);

  if (!success) {
    throw BadRequestError(error.message);
  }

  const response = await authService.login(data);
  setRefreshTokenCookie(res, response.refreshToken);

  return ApiResponse.ok(
    res,
    { accessToken: response.accessToken, user: response.user },
    "Logged in successfully.",
  );
});

/** Rotates the refresh token from the cookie and issues a new access token. */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw UnauthorizedError("Refresh token required.");
  }

  const tokens = await authService.refresh(refreshToken);
  setRefreshTokenCookie(res, tokens.newRefreshToken);

  return ApiResponse.ok(res, { accessToken: tokens.accessToken });
});

/** Revokes the current session and clears the refresh token cookie. */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw UnauthorizedError();
  }

  const response = await authService.logout(req.user.sessionId);

  clearRefreshTokenCookie(res);

  return ApiResponse.ok(res, response, "Logged out successfully.");
});

/** Revokes every session belonging to the user and clears the cookie. */
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw UnauthorizedError();
  }
  const response = await authService.logoutAll(req.user.id);

  clearRefreshTokenCookie(res);

  return ApiResponse.ok(res, response, "Logged out from all devices.");
});

/** Returns the profile of the currently authenticated user. */
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw UnauthorizedError();
  }

  const user = await authService.getCurrentUser(req.user.id);

  return ApiResponse.ok(res, user);
});
