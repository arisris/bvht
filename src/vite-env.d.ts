/// <reference types="vite/client" />

import type { Session } from "@auth/core/types";

type WorkerEnv = {
  NODE_ENV: "development" | "production";
};

declare type Variables = {
  user?: Session["user"];
  session?: Session;
  [k: string]: any;
};

declare type HEnv<E = Record<string, any>, V = Variables> = {
  Variables: Variables;
  Bindings: WorkerEnv & E;
};
