import { describe, expect, it } from "bun:test";
import app from "../src/index";

describe("Routing Tests", () => {
  it("GET / should return 200 and contain 'Hello Home!'", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Hello Home!");
  });

  it("GET /hello should return 200 and contain 'Hello World!'", async () => {
    const res = await app.request("/hello");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Hello World!");
  });

  it("GET /hello/bun should return 200 and contain 'Hello bun!'", async () => {
    const res = await app.request("/hello/bun");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Hello bun!");
  });

  it("GET /tailwind-demo should return 200 and contain 'Tailwind CSS v4 Demo'", async () => {
    const res = await app.request("/tailwind-demo");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Tailwind CSS v4 Demo");
  });
});
