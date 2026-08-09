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

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw UnauthorizedError("Refresh token required.");
  }

  const tokens = await authService.refresh(refreshToken);
  setRefreshTokenCookie(res, tokens.newRefreshToken);

  return ApiResponse.ok(res, { accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw UnauthorizedError();
  }

  const response = await authService.logout(req.user.sessionId);

  clearRefreshTokenCookie(res);

  return ApiResponse.ok(res, response, "Logged out successfully.");
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw UnauthorizedError();
  }
  const response = await authService.logout(req.user.id);

  return ApiResponse.ok(res, response, "Logged out from all devices.");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw UnauthorizedError();
  }

  const user = await authService.getCurrentUser(req.user.id);

  return ApiResponse.ok(res, user);
});
