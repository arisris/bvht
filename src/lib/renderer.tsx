import { type JSX, type Child } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";
import type { Env, Input, Handler, Context } from "hono";
import type { BlankInput } from "hono/types";
import type { HtmlEscapedString } from "hono/utils/html";

type RendererProps = {
  lang?: string;
  bodyProps?: JSX.IntrinsicElements["body"];
  slotScripts?: Child;
  headTags?: Child;
  title?: string;
  description?: string;
};

declare module "hono" {
  interface ContextRenderer {
    (content: Child, props?: RendererProps): Response | Promise<Response>;
  }
}

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
