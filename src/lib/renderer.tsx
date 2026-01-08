import { type JSX, type Child } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";
import type { Env, Input, Handler, Context } from "hono";
import type { BlankInput } from "hono/types";
import type { HtmlEscapedString } from "hono/utils/html";

/**
 * Props for the root renderer (the HTML shell).
 */
type RendererProps = {
  /** Language attribute for the <html> tag. Defaults to "en". */
  lang?: string;
  /** Props to spread onto the <body> tag. */
  bodyProps?: JSX.IntrinsicElements["body"];
  /** Script elements to be injected at the end of the body. */
  slotScripts?: Child;
  /** Elements to be injected into the <head>. */
  headTags?: Child;
  /** The page title. */
  title?: string;
  /** The page meta description. */
  description?: string;
};

declare module "hono" {
  interface ContextRenderer {
    (content: Child, props?: RendererProps): Response | Promise<Response>;
  }
}

/**
 * Creates the root HTML renderer middleware.
 *
 * This middleware wraps the route response in a standard HTML shell, including
 * the `<head>` with metadata and the `<body>` structure.
 *
 * @param {Parameters<typeof jsxRenderer>[1]} [options] - Configuration options for the `jsxRenderer`.
 * @returns {MiddlewareHandler} The configured renderer middleware.
 */
export const createRootRenderer = (
  options?: Parameters<typeof jsxRenderer>[1]
) => {
  return jsxRenderer(
    ({ children, ...props }) => {
      return (
        <html lang={props.lang ?? "en"}>
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            {props.title && <title>{props.title}</title>}
            {props.description && (
              <meta name="description" content={props.description} />
            )}
            {props.headTags}
          </head>
          <body {...(props.bodyProps ?? {})}>
            {children}
            {props.slotScripts}
          </body>
        </html>
      );
    },
    { stream: true, docType: true, ...options }
  );
};

export type PageMeta =
  | ((ctx: Context) => RendererProps | Promise<RendererProps>)
  | RendererProps;

export type PageProps<
  Params extends Record<string, unknown> = Record<string, unknown>
> = {
  params: Params;
  ctx: Context;
};
export type PageComponent<
  Params extends Record<string, unknown> = Record<string, unknown>
> = (
  props: PageProps<Params>
) => HtmlEscapedString | Promise<HtmlEscapedString>;

interface PageModule {
  meta?: PageMeta;
  default: PageComponent;
}

type PageInput = PageModule | Promise<PageModule> | (() => Promise<PageModule>);

/**
 * A helper to define a page route with metadata.
 *
 * It simplifies the process of rendering a component with specific `meta` properties
 * (like title, description) that are passed to the root renderer.
 *
 * Usage:
 *
 * ```ts
 * // pages/home.tsx
 * export const meta = (ctx) => ({ title: "Home" })
 * // or
 * // export const meta: PageMeta = { title: "Home" }
 * export default () => <h1>Hello World!</h1>
 * ```
 *
 * ```ts
 * // app.ts
 * app.get("/", page(() => import("./pages/home")));
 * ```
 *
 * @param {PageInput} input - The page module, a promise resolving to it, or a function returning that promise.
 * @returns {Handler} A Hono handler that renders the page.
 */
export const page =
  <E extends Env = any, P extends string = any, I extends Input = BlankInput>(
    input: PageInput
  ): Handler<E, P, I> =>
  async (ctx, _next) => {
    let page: PageModule;

    if (typeof input === "function") {
      page = await input();
    } else {
      page = await input;
    }
    let rendererProps: RendererProps = {};
    if (page.meta) {
      if (typeof page.meta === "function") {
        rendererProps = await page.meta(ctx);
      } else if (typeof page.meta === "object") {
        rendererProps = page.meta;
      }
    }

    const PageComponent = page.default;
    return ctx.render(
      <PageComponent params={ctx.req.param()} ctx={ctx} />,
      rendererProps
    );
  };
