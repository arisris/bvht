import { jsxRenderer } from "hono/jsx-renderer";
import { createApp } from "../lib/factory";
import { rootRenderer, page } from "../lib/page";
import { getAsset, getDarkModeScript } from "../lib/util";
import type { Session } from "@auth/core/types";

const app = createApp();

app.use(
  /** Init root renderer */
  rootRenderer(),
  /** Init layout page renderer */
  jsxRenderer(({ Layout, ...props }) => {
    props.headTags = (
      <>
        {props.headTags}
        <link rel="stylesheet" href={getAsset("src/client/tailwind.css")} />
        <script dangerouslySetInnerHTML={{ __html: getDarkModeScript() }} />
      </>
    );
    props.slotScripts = (
      <>
        {props.slotScripts}
        <script type="module" src={getAsset("src/client/main.ts")} />
      </>
    );
    return <Layout {...props} />;
  })
);

app.get("/", (c) =>
  c.render(
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <header class="text-center space-y-4">
          <h1 class="text-4xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
            Hello Home!
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Welcome to the home page.
          </p>
        </header>

        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <div class="flex flex-col gap-3">
            <a
              href="/protected-page"
              class="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-center rounded-lg transition-colors font-medium"
            >
              Go to Protected Page
            </a>
            <a
              href="/tailwind-demo"
              class="w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-center rounded-lg transition-colors font-medium"
            >
              View Tailwind v4 Demo
            </a>
          </div>
        </div>
      </div>
    </div>,
    {
      title: "Home",
      description: "This is the home page",
    }
  )
);

app.get("/protected-page", async (c) => {
  const user = c.get("user") as Session["user"] | undefined;
  if (!user) {
    return c.redirect(
      `/api/auth/signin?error=SessionRequired&callbackUrl=${c.req.url}`
    );
  }
  return c.render(
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <header class="text-center space-y-4">
          <h1 class="text-4xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
            Protected Page
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            You are logged in as {user.name}.
          </p>
        </header>

        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          <div class="flex flex-col items-center space-y-4">
            {user.image && (
              <img
                src={user.image}
                alt={user.name || "User"}
                class="w-24 h-24 rounded-full border-4 border-brand-100 dark:border-brand-900"
              />
            )}
            <div class="text-center space-y-1">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <a
              href="/"
              class="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-center rounded-lg transition-colors font-medium"
            >
              Go to Home Page
            </a>
            <a
              href={`/api/auth/signout?callbackUrl=${c.req.url}`}
              class="w-full py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-center rounded-lg transition-colors font-medium"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </div>,
    {
      title: "Protected Page",
      description: "This is a protected page",
    }
  );
});

app.get("/tailwind-demo", page(() => import("./tailwind-demo")));

export default app;
