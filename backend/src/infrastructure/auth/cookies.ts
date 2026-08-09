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

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, token, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshCookieOptions);
};
