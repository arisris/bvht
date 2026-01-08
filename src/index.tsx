import { createApp } from "./lib/factory";
import appRoutes from "./routes/app";
import { authApiRoute, authSessionMiddleware } from "./lib/auth";

const app = createApp();

/**
 * Serve static assets in production mode
 * In development mode, assets are served automatically by Vite
 */
if (import.meta.env.PROD) {
  const { serveStatic } = await import("hono/bun");
  app.use("/assets/*", serveStatic({ root: "./dist" }));
}
app.use("*", authSessionMiddleware);
app.use("/api/auth/*", authApiRoute);
app.route("/", appRoutes);

export default app;
