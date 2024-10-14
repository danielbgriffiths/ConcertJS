import { AsyncImport } from "../types";

export function lazyImport<T>(modulePath: string): AsyncImport<T> {
  return async () => {
    const module = await import(modulePath);
    return module.default ?? module;
  };
}
