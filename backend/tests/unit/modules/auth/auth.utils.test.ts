/**
 * @file auth.utils.test.ts
 *
 * @description Unit tests for auth helper functions: session expiry calculation
 * and mapping a persisted user row into the public response DTO.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const msMock = vi.fn();

vi.mock("ms", () => ({
  default: (...args: unknown[]) => msMock(...args),
}));

vi.mock("../../../../src/config/env.js", () => ({
  env: {
    JWT_REFRESH_EXPIRES_IN: "30d",
  },
}));

import {
  calculateExpiry,
  toUserResponseDto,
} from "../../../../src/modules/auth/auth.utils.js";
import { User } from "../../../../src/domain/auth/user.types.js";
import { UserResponseDto } from "../../../../src/modules/auth/auth.dto.js";
import { env } from "../../../../src/config/env.js";
import type { MockedObject } from "vitest";

/** A representative persisted user row for the DTO mapping tests. */
const user: User = {
  id: "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91",
  name: "Ada Lovelace",
  email: "ada@test.local",
  passwordHash: "$2b$12$hashedpasswordvalue",
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

describe("calculateExpiry", () => {
  beforeEach(() => {
    msMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds a numeric milliseconds value from env to the current time", () => {
    (env as unknown as MockedObject<typeof env>).JWT_REFRESH_EXPIRES_IN = 1_000;

    expect(calculateExpiry().getTime()).toBe(
      new Date("2026-01-01T00:00:01.000Z").getTime(),
    );
  });

  it("converts a string duration through ms for the expiry", () => {
    (env as unknown as MockedObject<typeof env>).JWT_REFRESH_EXPIRES_IN = "30d";
    msMock.mockReturnValue(2_592_000_000);

    expect(calculateExpiry().getTime()).toBe(
      new Date("2026-01-01T00:00:00.000Z").getTime() + 2_592_000_000,
    );
    expect(msMock).toHaveBeenCalledWith("30d");
  });
});

describe("toUserResponseDto", () => {
  it("maps the public fields and drops passwordHash and updatedAt", () => {
    const dto: UserResponseDto = toUserResponseDto(user);

    expect(dto).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: null,
      emailVerified: false,
      createdAt: user.createdAt,
    });
    expect(dto).not.toHaveProperty("passwordHash");
    expect(dto).not.toHaveProperty("updatedAt");
  });
});
