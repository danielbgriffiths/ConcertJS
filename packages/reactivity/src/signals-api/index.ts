export type ConcertSignalGetter<T = any> = () => T;

export type ConcertSignalSetter<T = any> = (nextValue: T | ((previous: T) => void)) => void;

export type ConcertSignal<T = any> = [ConcertSignalGetter<T>, ConcertSignalSetter<T>];

export type ConcertEffectCallbackReturn = void | (() => void);

export type ConcertEffectFn = () => ConcertEffectCallbackReturn;

export type ConcertCancelEffectFn = () => void;

let activeEffect: null | (() => void) = null;
const effectStack: (() => void)[] = [];
const subscribersList: Set<() => void>[] = [];
const batchQueue = new Set<() => void>();
let isBatching = false;

function cleanupEffect(effect: ConcertEffectFn): void {
  subscribersList.forEach(subscriberSet => subscriberSet.delete(effect));
}

function batchUpdate(effectFn: ConcertEffectFn): void {
  if (!isBatching) {
    isBatching = true;

    Promise.resolve().then(() => {
      batchQueue.forEach(effect => effect());
      batchQueue.clear();
      isBatching = false;
    });
  }

  batchQueue.add(effectFn);
}

function getActiveEffect(): ConcertEffectFn | null {
  return activeEffect;
}

export function signal<T>(initialValue: T): ConcertSignal<T> {
  let value = initialValue;
  const subscribers = new Set<() => void>();

  const get: ConcertSignalGetter<T> = () => {
    const currentActiveEffect = getActiveEffect();
    if (currentActiveEffect) {
      subscribers.add(currentActiveEffect);
    }
    return value;
  };

  const set: ConcertSignalSetter<T> = newValue => {
    const resolvedValue = typeof newValue === "function" ? (newValue as Function)(value) : newValue;

    if (resolvedValue === value) return;

    value = resolvedValue;
    subscribers.forEach(batchUpdate);
  };

  subscribersList.push(subscribers);

  return [get, set];
}

export function effect(effectFn: ConcertEffectFn): ConcertCancelEffectFn {
  let onCleanup!: (() => void) | void | Promise<void> | Promise<() => void>;

  const effect = (): void => {
    cleanupEffect(effect);
    activeEffect = effect;

    effectStack.push(effect);
    onCleanup = effectFn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1] || null;
  };

  effect();

  return (): void => {
    if (typeof onCleanup === "function") {
      onCleanup();
    }

    cleanupEffect(effect);
  };
}

export function memo<T = any>(computedFn: () => T): ConcertSignalGetter<T> {
  let value: T;
  let isStale = true;
  const subscribers = new Set<() => void>();

  const markStale = (): void => {
    isStale = true;
    subscribers.forEach(batchUpdate);
  };

  const memoEffect = (): T => {
    const currentActiveEffect = getActiveEffect();

    if (currentActiveEffect) {
      subscribers.add(currentActiveEffect);
    }

    if (isStale) {
      const tempActiveEffect = currentActiveEffect;
      activeEffect = markStale;
      value = computedFn();
      activeEffect = tempActiveEffect;
      isStale = false;
    }

    return value;
  };

  effect(markStale);

  subscribersList.push(subscribers);

  return memoEffect;
}
