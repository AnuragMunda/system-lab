/**
 * @file cookies.ts
 *
 * @description Helpers for setting and clearing the refresh token cookie, with
 * security flags (HttpOnly, Secure in production, strict SameSite).
 */

import type { CookieOptions, Response } from "express";

import { env } from "@/config/env.js";

const isProduction = env.NODE_ENV === "production";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  path: "/api/v1/auth/refresh",
  maxAge: env.REFRESH_TOKEN_MAX_AGE,
};

/** Sets the refresh token cookie on the response. */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, token, refreshCookieOptions);
};

/** Clears the refresh token cookie from the response. */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshCookieOptions);
};
