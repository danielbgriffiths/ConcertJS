import { ConcertStructuralComponent } from "./types";

export { h } from "./h";
export { render } from "./render";
export { signal, memo, effect } from "./signals";
export type {
  ConcertSignalGetter,
  ConcertSignalSetter,
  ConcertSignal,
  ConcertEffectFn,
  LinkProps,
  ComponentPropsWithChildren
} from "./types";

const injectMetadata = new Map<Function, string[]>();

export function ConcertLog(target: Function, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.info(`Calling ${target.name}.${propertyKey} with: `, args);
    return originalMethod.apply(this, args);
  };
}

export function With(...providedServices: Function[]) {
  return function (target: ConcertStructuralComponent): void {
    if (!target.services) {
      target.services = {};
    }

    for (const service of providedServices) {
      if (!service) continue;

      if (!service.name) {
        throw new Error("Service must have a name");
      }

      target.services[service.name] = service;
    }
  };
}

export function Inject(...requestedServices: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    injectMetadata.set(originalMethod, requestedServices);
    return descriptor;
  };
}

export function Route(path: string) {
  return function (constructor: Function) {};
}
