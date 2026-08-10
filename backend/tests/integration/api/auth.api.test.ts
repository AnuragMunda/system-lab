/**
 * @file auth.api.test.ts
 *
 * @description Integration tests for the auth HTTP endpoints, exercised through
 * supertest against the real app and database: register, login, refresh
 * (with cookie rotation), me, logout, and logout-all.
 */

import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../../../src/app.js";
import { resetDb, getTestDatabaseUrl } from "../helpers/db.js";
import { createUser } from "../helpers/fixtures.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

/** Extracts the refresh token value from a supertest response's Set-Cookie. */
function getRefreshToken(res: request.Response): string {
  const raw = res.headers["set-cookie"];
  const setCookie = Array.isArray(raw) ? (raw[0] as string) : (raw as string);
  const match = /refreshToken=([^;]+)/.exec(setCookie);
  return match?.[1] ?? "";
}

describeDb("Auth API", () => {
  beforeEach(async () => {
    await resetDb(getTestDatabaseUrl());
  });

  const registerBody = (email: string) => ({
    name: "Ada Lovelace",
    email,
    password: "supersecret1",
  });

  describe("POST /api/v1/auth/register", () => {
    it("registers a user and persists it", async () => {
      const email = `new-${Date.now()}@test.local`;

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody(email));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User registered successfully.");
      expect(res.body.data).toMatchObject({ name: "Ada Lovelace", email });

      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password: "supersecret1" });
      expect(loginRes.status).toBe(200);
    });

    it("returns 409 for a duplicate email", async () => {
      const email = `dupe-${Date.now()}@test.local`;
      await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody(email))
        .expect(201);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody(email));

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ success: false, code: "CONFLICT" });
    });

    it("returns 400 for an invalid payload", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "A", email: "not-an-email", password: "x" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: "BAD_REQUEST" });
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns 401 for an unknown email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: `unknown-${Date.now()}@test.local`,
          password: "password123",
        });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });

    it("returns 401 for a wrong password", async () => {
      const { user } = await createUser();
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });

    it("returns an access token and sets a refresh cookie", async () => {
      const { user, password } = await createUser();

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logged in successfully.");
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.user).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      expect(res.body.data.refreshToken).toBeUndefined();
      expect(getRefreshToken(res)).not.toBe("");
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("returns a new access token and rotates the refresh cookie", async () => {
      const { user, password } = await createUser();
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password });
      const cookie = getRefreshToken(loginRes);

      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${cookie}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(getRefreshToken(res)).not.toBe("");
      expect(getRefreshToken(res)).not.toBe(cookie);
    });

    it("rejects the previously rotated refresh token", async () => {
      const { user, password } = await createUser();
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password });
      const cookie = getRefreshToken(loginRes);

      await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${cookie}`)
        .expect(200);

      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${cookie}`);

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });

    it("returns 401 when no refresh token is provided", async () => {
      const res = await request(app).post("/api/v1/auth/refresh");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        code: "UNAUTHORIZED",
        message: "Refresh token required.",
      });
    });

    it("returns 401 for an invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", "refreshToken=garbage-token");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let accessToken: string;
    let email: string;

    beforeEach(async () => {
      const { user, password } = await createUser();
      email = user.email;
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });
      accessToken = loginRes.body.data.accessToken as string;
    });

    it("returns the current user", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
    });

    it("returns 401 without an access token", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });

    it("returns 401 for a garbage access token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer not-a-real-token");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, code: "UNAUTHORIZED" });
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("revokes the current session so refresh is rejected", async () => {
      const { user, password } = await createUser();
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password });
      const accessToken = loginRes.body.data.accessToken as string;
      const refreshToken = getRefreshToken(loginRes);

      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logged out successfully.");

      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${refreshToken}`);
      expect(refreshRes.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout-all", () => {
    it("revokes every session belonging to the user", async () => {
      const { user, password } = await createUser();

      const firstLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password });
      const secondLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password });

      const firstCookie = getRefreshToken(firstLogin);
      const secondCookie = getRefreshToken(secondLogin);

      const res = await request(app)
        .post("/api/v1/auth/logout-all")
        .set(
          "Authorization",
          `Bearer ${firstLogin.body.data.accessToken as string}`,
        );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logged out from all devices.");

      const firstRefresh = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${firstCookie}`);
      const secondRefresh = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refreshToken=${secondCookie}`);

      expect(firstRefresh.status).toBe(401);
      expect(secondRefresh.status).toBe(401);
    });
  });
});
