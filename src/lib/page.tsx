import { type JSX, type Child, type FC, createElement } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";
import type { Env, Input, Handler, Context, Next } from "hono";
import type { BlankInput, MiddlewareHandler } from "hono/types";

// ===========================================================================
// SECTION 1: Type Utilities (Inference Magic)
// ===========================================================================

/** Converts a Union (A | B) to an Intersection (A & B) */
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/** Extracts the data type from a hook return, ignoring Response or void */
type ExtractData<T> = T extends Response | void
  ? {}
  : Exclude<Awaited<T>, Response | void>;

/** Helper to ensure inputs are always arrays */
function toArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

// ===========================================================================
// SECTION 2: Domain Types (Props & Hooks)
// ===========================================================================

/**
 * Props passed to the root HTML shell (rootRenderer).
 */
export type RendererProps = {
  lang?: string;
  bodyProps?: JSX.IntrinsicElements["body"];
  slotScripts?: Child;
  headTags?: Child;
  title?: string;
  description?: string;
};

/**
 * Props passed to your Page Component.
 */
export type PageProps<Data = {}> = {
  ctx: Context;
  data: Data;
};

/**
 * Return type for `before` hooks.
 * - `Response`: Redirects or errors (stops rendering).
 * - `Object`: Data passed to component.
 * - `void`: Continue without data.
 */
export type BeforeHookReturn = Response | Record<string, any> | void;

export type PageBeforeHook = (
  ctx: Context,
  next: Next
) => BeforeHookReturn | Promise<BeforeHookReturn>;

export type PageBeforeHooks = PageBeforeHook | PageBeforeHook[];

export type PageAfterHook<Data = any> = (
  ctx: Context,
  response: Response,
  data: Data
) => Response | void | Promise<Response | void>;

export type PageAfterHooks<Data = any> =
  | PageAfterHook<Data>
  | PageAfterHook<Data>[];

export type PageMeta =
  | ((ctx: Context) => RendererProps | Promise<RendererProps>)
  | RendererProps;

// Augment Hono Context
declare module "hono" {
  interface ContextRenderer {
    (content: Child, props?: RendererProps): Response | Promise<Response>;
  }
}

// ===========================================================================
// SECTION 3: Root Renderer (HTML Shell)
// ===========================================================================

export const rootRenderer = (
  options?: Parameters<typeof jsxRenderer>[1]
): MiddlewareHandler => {
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
    { stream: false, docType: true, ...options }
  );
};

// ===========================================================================
// SECTION 4: Page Definition Helper
// ===========================================================================

/**
 * Defines a page with automatic type inference.
 * The `data` prop in `render` will automatically match the merged return types
 * of all `before` hooks.
 */
export function definePage<
  Before extends PageBeforeHooks | undefined,
  Data = Before extends undefined
    ? {}
    : UnionToIntersection<
        ExtractData<
          Before extends Array<infer F>
            ? F extends (...args: any) => any
              ? ReturnType<F>
              : never
            : Before extends (...args: any) => any
            ? ReturnType<Before>
            : never
        >
      >
>(config: {
  meta?: PageMeta;
  before?: Before;
  after?: PageAfterHooks<Data>;
  render: FC<PageProps<Data>>;
}) {
  // Attach hooks to the component so the 'page' handler can find them
  const comp = config.render as any;
  comp.before = config.before;
  comp.after = config.after;
  comp.meta = config.meta;
  return comp;
}

// ===========================================================================
// SECTION 5: Main Page Handler
// ===========================================================================

interface PageModule {
  meta?: PageMeta;
  before?: PageBeforeHooks;
  after?: PageAfterHooks;
  default: any;
}

type PageInput = PageModule | Promise<PageModule> | (() => Promise<PageModule>);

/**
 * Hono Middleware to render a Page Module.
 * Handles `before` hooks (data loading/guards), rendering, and `after` hooks.
 */
export const page =
  <E extends Env, P extends string, I extends Input = BlankInput>(
    input: PageInput
  ): Handler<E, P, I> =>
  async (ctx, next) => {
    // 1. Resolve Module
    let pageModule: PageModule;
    if (typeof input === "function") {
      pageModule = await input();
    } else {
      pageModule = await input;
    }

    const Comp = pageModule.default;

    // 2. Normalize Hooks
    // Look for hooks on named exports (module.before) or attached to default (definePage)
    const beforeHooks = toArray(pageModule.before || Comp.before);
    const afterHooks = toArray(pageModule.after || Comp.after);
    const metaHook = pageModule.meta || Comp.meta;

    // 3. Execution State
    let hookData: any = {};
    let nextCalled = false;
    
    // Wrapper to detect if a hook calls next()
    const wrappedNext: Next = async () => {
      nextCalled = true;
    };

    // 4. Run "Before" Hooks
    for (const hook of beforeHooks) {
      const result = await hook(ctx, wrappedNext);

      // Priority A: Stop if next() called (Skip Handler)
      if (nextCalled) return next();

      // Priority B: Stop if Response returned (Redirect)
      if (result instanceof Response) return result;

      // Priority C: Merge Data
      if (result && typeof result === "object") {
        hookData = { ...hookData, ...result };
      }
    }

    // 5. Resolve Meta
    let rendererProps: RendererProps = {};
    if (metaHook) {
      if (typeof metaHook === "function") {
        rendererProps = await metaHook(ctx);
      } else if (typeof metaHook === "object") {
        rendererProps = metaHook;
      }
    }

    // 6. Render Page
    // Pass merged hookData as 'data' prop
    const content = createElement(Comp, { ctx, data: hookData });
    let finalResponse = await ctx.render(content, rendererProps);

    // 7. Run "After" Hooks
    for (const hook of afterHooks) {
      const result = await hook(ctx, finalResponse, hookData);

      // Allow overriding the response
      if (result instanceof Response) {
        finalResponse = result;
      }
    }

    return finalResponse;
  };