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
  page({ default: () => <h1 class="text-2xl text-red-500">Hello Home!</h1> })
);

app.get("/hello", page(import("../routes/hello")));

export default app;
