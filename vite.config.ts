import path from "node:path";
import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import bun from "@hono/vite-dev-server/bun";
import tailwindcss from "@tailwindcss/vite";

const serverEntry = "src/index.tsx";
const clientEntry = ["src/client/main.ts", "src/client/tailwind.css"];
export default defineConfig(({ isSsrBuild, command }) => ({
  plugins: [
    command === "serve"
      ? [
          /** apply serve only plugins */
          devServer({
            entry: serverEntry,
            adapter: bun(),
          }),
        ]
      : [
          /** apply build only plugins */
        ],
    /** provides plugins both build | serve commands */
    tailwindcss({ optimize: command === "build" }),
  ],
  build: {
    manifest: !isSsrBuild,
    copyPublicDir: !isSsrBuild,
    emptyOutDir: !isSsrBuild,
    minify: !isSsrBuild,
    // outDir: isSsrBuild ? "./dist" : "./dist/public",
    assetsDir: isSsrBuild ? "chunks" : "assets",
    rollupOptions: {
      input: isSsrBuild ? { index: serverEntry } : clientEntry,
      treeshake: {
        preset: "smallest",
        annotations: false,
      },
      output: isSsrBuild ? { format: "esm" } : undefined,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ...(command === "serve"
    ? {
        server: {
          port: parseInt(process.env.PORT ?? "3000"),
        },
      }
    : {
        esbuild: {
          jsxImportSource: isSsrBuild ? "hono/jsx" : "hono/jsx/dom",
          legalComments: "none",
          ignoreAnnotations: isSsrBuild || undefined,
        },
      }),
}));
