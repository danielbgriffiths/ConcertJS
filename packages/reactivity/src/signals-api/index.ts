import { Signal } from "./signal";
import { ComputedSignal } from "./computed-signal";
import { Effect } from "./effect";

export function signal<T>(initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  const s = new Signal<T>(initialValue);

  const get = (): T => s.value;

  const set = (value: T | ((prev: T) => T)) => {
    if (typeof value === "function") {
      const updater = value as (prev: T) => T;
      s.value = updater(s.value);
    } else {
      s.value = value;
    }
  };

  return [get, set];
}

export function memo<T>(computeFn: () => T): () => T {
  const cs = new ComputedSignal<T>(computeFn);
  return (): T => cs.value;
}

export function effect(effectFn: () => void | (() => void)): () => void {
  const e = new Effect(effectFn);
  return () => e.dispose();
}
