export type ConcertSignalGetter<T = any> = () => T;

export type ConcertSignalSetter<T = any> = (nextValue: T | ((previous: T) => void)) => void;

export type ConcertSignal<T = any> = [ConcertSignalGetter<T>, ConcertSignalSetter<T>];

export type ConcertEffectFn = () => void;

export type ConcertInstance = {};

export declare class ConcertStructuralComponent {
  render<P = any>(): ConcertFunctionalComponent<P>;
}

export type ConcertFunctionalComponent<P = any> = (
  props?: P,
  instance?: ConcertInstance
) => JSX.Element;

export type ConcertComponent<P = any> = ConcertStructuralComponent | ConcertFunctionalComponent<P>;
