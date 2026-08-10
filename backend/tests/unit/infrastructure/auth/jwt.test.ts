/**
 * @file jwt.test.ts
 *
 * @description Unit tests for the JWT helpers. Secrets are injected via a
 * mocked env module so the signed-token behavior can be verified deterministically.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("../../../../src/config/env.js", () => ({
  env: {
    JWT_ACCESS_SECRET: "unit-test-access-secret-0123456789abcdef",
    JWT_REFRESH_SECRET: "unit-test-refresh-secret-0123456789abcdef",
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "30d",
  },
}));

import jwt from "jsonwebtoken";
import { ApiError } from "../../../../src/lib/apiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../../src/infrastructure/auth/jwt.js";

const payload = {
  sub: "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
  email: "ada@test.local",
  sid: "5e6f7g8h-1111-4e40-a1c5-4d2d5bce0f91",
};

describe("access tokens", () => {
  it("round-trips through signAccessToken and verifyAccessToken", () => {
    const token = signAccessToken(payload);

    expect(token).toEqual(expect.any(String));
    expect(verifyAccessToken(token)).toEqual(payload);
  });

  it("rejects a refresh token signed with the wrong secret", () => {
    const refreshToken = signRefreshToken(payload);

    expect(() => verifyAccessToken(refreshToken)).toThrow(ApiError);
  });
});

describe("refresh tokens", () => {
  it("round-trips through signRefreshToken and verifyRefreshToken", () => {
    const token = signRefreshToken(payload);

    expect(verifyRefreshToken(token)).toEqual(payload);
  });

  it("rejects an access token signed with the wrong secret", () => {
    const accessToken = signAccessToken(payload);

    expect(() => verifyRefreshToken(accessToken)).toThrow(ApiError);
  });
});

describe("verification failures", () => {
  it("rejects a tampered token", () => {
    const token = signAccessToken(payload);
    const [header, body, signature] = token.split(".");
    const flip = (char: string) => (char === "A" ? "B" : "A");
    const tamperedSignature = flip(signature![0]!) + signature!.slice(1);
    const tampered = `${header}.${body}.${tamperedSignature}`;

    expect(() => verifyAccessToken(tampered)).toThrow(ApiError);
  });

  it("rejects an expired token", () => {
    const expired = jwt.sign(
      payload,
      "unit-test-access-secret-0123456789abcdef",
      {
        expiresIn: -1000,
      },
    );

    expect(() => verifyAccessToken(expired)).toThrow(ApiError);
  });

  it("rejects a token with a malformed payload", () => {
    const malformed = jwt.sign(
      { sub: 123 },
      "unit-test-access-secret-0123456789abcdef",
    );

    expect(() => verifyAccessToken(malformed)).toThrow(ApiError);
  });
});
