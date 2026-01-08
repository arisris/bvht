import { jsxRenderer } from "hono/jsx-renderer";
import { createApp } from "../lib/factory";
import { createRootRenderer, page } from "../lib/renderer";
import { getAsset, getDarkModeScript } from "../lib/util";

const app = createApp();

app.use(
  createRootRenderer(),
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

app.get(
  "/",
  page({
    default: () => (
      <div class="p-8 space-y-4">
        <h1 class="text-2xl font-bold text-red-500">Hello Home!</h1>
        <div class="flex flex-col gap-2">
          <a href="/hello" class="text-blue-500 underline">
            Go to Hello Page
          </a>
          <a href="/tailwind-demo" class="text-blue-500 underline">
            View Tailwind v4 Demo
          </a>
        </div>
      </div>
    ),
  })
);

app.get("/hello", page(import("../routes/hello")));
app.get("/tailwind-demo", page(import("./tailwind-demo")));

export default app;
