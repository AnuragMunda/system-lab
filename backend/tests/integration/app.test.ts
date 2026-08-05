import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/app.js";

const describeDb = process.env.TEST_DB_UNAVAILABLE ? describe.skip : describe;

describeDb("app", () => {
  it("GET / responds with the welcome message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Welcome to the System Lab API!" });
  });

  it("GET /health responds OK", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "OK", message: "Server is healthy." });
  });

  it("returns 404 for an unknown route", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
  });
});
