/**
 * @file auth.schema.test.ts
 *
 * @description Unit tests for the auth Zod schemas, covering accepted payloads
 * and validation failures for register and login.
 */

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
} from "../../../../src/modules/auth/auth.schema.js";

/** A fully valid registration payload used as the baseline for tests. */
const validRegister = {
  name: "Ada Lovelace",
  email: "ada@test.local",
  password: "supersecret1",
  avatarUrl: "https://example.com/avatar.png",
};

/** A fully valid login payload used as the baseline for tests. */
const validLogin = {
  email: "ada@test.local",
  password: "supersecret1",
};

describe("registerSchema", () => {
  it("accepts a valid payload (avatarUrl optional)", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
    expect(
      registerSchema.safeParse({ ...validRegister, avatarUrl: undefined })
        .success,
    ).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...validRegister, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 100 characters", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid avatarUrl", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      avatarUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid payload", () => {
    expect(loginSchema.safeParse(validLogin).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ ...validLogin, email: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ ...validLogin, password: "" });
    expect(result.success).toBe(false);
  });
});
