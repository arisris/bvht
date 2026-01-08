import { createFactory } from "hono/factory";

/**
 * Creates a Hono factory for generating app instances, handlers, and middleware.
 *
 * This utility allows for better type inference and code organization when building
 * Hono applications.
 *
 * - `createApp`: Creates a new Hono application instance.
 * - `createHandlers`: Creates request handlers.
 * - `createMiddleware`: Creates middleware functions.
 */
export const { createApp, createHandlers, createMiddleware } = createFactory();
