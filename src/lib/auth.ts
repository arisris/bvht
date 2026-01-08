import type { Env, MiddlewareHandler, Context } from "hono";
import type {
  AuthConfig,
  Session,
  SignInPageErrorParam,
} from "@auth/core/types";
import { Auth } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { env } from "hono/adapter";

export const AUTH_BASE_PATH = "/api/auth";
export const AUTH_ROUTE_PATH = `${AUTH_BASE_PATH}/*`;

/**
 * Generates the authentication configuration for the application.
 *
 * @param {Context<E>} c - The Hono context, used to access environment variables.
 * @returns {Omit<AuthConfig, "raw">} The configuration object for Auth.js.
 */
export const getAuthConfig = <E extends Env>(
  c: Context<E>
): Omit<AuthConfig, "raw"> => {
  return {
    basePath: AUTH_BASE_PATH,
    providers: [
      // example credential
      Credentials({
        credentials: {
          username: {
            label: "Username",
            type: "text",
            placeholder: "admin",
          },
          password: {
            label: "Password",
            type: "password",
            placeholder: "password",
          },
        },
        async authorize(credentials) {
          const userEnv: string =
            (env(c).AUTH_USER as string | undefined) ?? "admin:password";
          if (!credentials) return null;
          const { username, password } = credentials;
          const [user, pass] = userEnv.split(":");
          if (username !== user || password !== pass) {
            return null;
          }
          return {
            id: "1",
            name: "Admin",
            email: "a@a.com",
            image: "https://i.pravatar.cc/300",
          };
        },
      }),
    ],
    secret:
      (env(c).AUTH_SECRET as string | undefined) ??
      "not-so-secret-please-provide-in-environment",
    trustHost: true,
    logger: {
      error(_error) {
        // console.error(error.name)
      },
      debug(_message, _metadata) {
        // log debug
      },
      warn(_code) {
        // log warning
      },
    },
  };
};

/**
 * Retrieves the current session for the request.
 *
 * It simulates an internal request to the Auth.js session endpoint.
 *
 * @param {Context} c - The Hono context.
 * @returns {Promise<Session | null>} The session object if authenticated, or null.
 */
export const getSession = async (c: Context): Promise<Session | null> => {
  try {
    const url = new URL(`${AUTH_BASE_PATH}/session`, c.req.raw.url);
    const request = new Request(url, {
      headers: c.req.raw.headers,
    });
    const response = await Auth(request, getAuthConfig(c));
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !Object.keys(data).length) return null;
    if (!data.user) return null;
    return data;
  } catch (e) {
    return null;
  }
};

/**
 * Middleware to handle Auth.js routes.
 *
 * This mounts the Auth.js handler on the configured base path.
 *
 * @returns {MiddlewareHandler} The Hono middleware handler.
 */
export const setupAuthPage =
  <E extends Env>(): MiddlewareHandler<E, typeof AUTH_ROUTE_PATH> =>
  async (c, next) => {
    if (c.req.path.startsWith(AUTH_BASE_PATH))
      return Auth(c.req.raw, getAuthConfig(c));
    return next();
  };

/**
 * Middleware to protect routes and ensure the user is signed in.
 *
 * If the user is not authenticated, they are redirected to the sign-in page.
 *
 * @returns {MiddlewareHandler} The Hono middleware handler.
 */
export const onlySignedUser =
  <E extends Env>(): MiddlewareHandler<E, typeof AUTH_ROUTE_PATH> =>
  async (c, next) => {
    const session = await getSession(c);
    if (!session?.user)
      return c.redirect(
        `${AUTH_BASE_PATH}/signin?error=${
          "SessionRequired" as SignInPageErrorParam
        }&callbackUrl=${c.req.url}`
      );
    return next();
  };
