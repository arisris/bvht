import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { setupAuthPage, onlySignedUser, AUTH_BASE_PATH } from "../src/lib/auth";

describe("Auth Tests", () => {
  it("setupAuthPage should handle auth routes", async () => {
    const app = new Hono();
    // Mount the auth middleware
    app.use("/api/auth/*", setupAuthPage());

    // Simulate a request to the signin page (provided by Auth.js)
    const res = await app.request(`${AUTH_BASE_PATH}/signin`);

    // Auth.js usually returns 200 for the signin page or redirects
    // We just want to make sure the middleware caught it and didn't 404
    expect(res.status).not.toBe(404);
  });

  it("onlySignedUser should redirect if not authenticated", async () => {
    const app = new Hono();

    // Protected route
    app.get("/protected", onlySignedUser(), (c) => c.text("Protected Content"));

    const res = await app.request("/protected");

    // Should be a redirect (302) to the signin page
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toContain(`${AUTH_BASE_PATH}/signin`);
    expect(res.headers.get("Location")).toContain("error=SessionRequired");
  });
});
