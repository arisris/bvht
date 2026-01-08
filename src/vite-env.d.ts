/// <reference types="vite/client" />

type WorkerEnv = {
  NODE_ENV: "development" | "production";
};

declare type HEnv<E = Record<string, any>, V = Record<string, any>> = {
  Variables: Record<string, any> & V;
  Bindings: WorkerEnv & E;
};
