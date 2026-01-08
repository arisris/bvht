import { createApp } from "./lib/factory";
import { getRuntimeKey } from "hono/adapter";
import { createRootRenderer } from "./lib/renderer";
import appRoutes from "./routes/app";
import { setupAuthPage } from "./lib/auth";

const app = createApp();

app.use(createRootRenderer());

console.log(Bun.version)

if (import.meta.env.PROD && getRuntimeKey() === "bun") {
  const { serveStatic } = await import("hono/bun");
  app.use("/assets/*", serveStatic({ root: "./dist" }));
}
app.use("/api/auth/*", setupAuthPage());
app.route("/", appRoutes);

app.get("/hello/:name", (c) => {
  return c.text(`Hello ${c.req.param("name")}!`);
});

export default app;
