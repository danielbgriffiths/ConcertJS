export { signal, memo, effect } from "@concertjs/reactivity";

export { mount, h, onMount, onCleanup } from "./render-engine";
export type {
  ConcertSignalGetter,
  ConcertSignalSetter,
  ConcertSignal,
  ConcertEffectFn
} from "./types";

export function ConcertLog(target: Function, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.info(`Calling ${target.name}.${propertyKey} with: `, args);
    return originalMethod.apply(this, args);
  };
}
