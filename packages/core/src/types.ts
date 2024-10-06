export type ConcertSignalGetter<T = any> = () => T;

export type ConcertSignalSetter<T = any> = (nextValue: T | ((previous: T) => void)) => void;

export type ConcertSignal<T = any> = [ConcertSignalGetter<T>, ConcertSignalSetter<T>];

export type ConcertEffectFn = () => void;

export type ConcertInstance = {};

export declare class ConcertStructuralComponent<P = any> {
  render: ConcertFunctionalComponent<P>;
}

export type ConcertFunctionalComponent<P = any> = (
  props?: P,
  instance?: ConcertInstance
) => JSX.Element;

export type ConcertComponent<P = any> = ConcertStructuralComponent | ConcertFunctionalComponent<P>;

export type ConcertPropsWithChildren = {
  children: JSX.Element | JSX.Element[];
};

export type _ElementDescriptor = {
  descriptor: PropertyDescriptor;
  key: string;
  kind: "class" | "method" | "field";
  placement: "static" | "prototype";
};

export interface MeasurePerformanceOptions {
  isEnabled?: boolean;
  name: string;
}

export interface HeadMetaOptions {
  name?: string;
  content?: string;
  property?: string;
  charset?: string;
  "http-equiv"?: string;
}

export interface HeadLinkOptions {
  rel?: string;
  href?: string;
  type?: string;
}

export interface HeadScriptOptions {
  src?: string;
  type?: string;
  defer?: boolean;
}

export interface HeadOptions {
  title?: string;
  meta?: HeadMetaOptions[];
  link?: HeadLinkOptions[];
  script?: HeadScriptOptions[];
}
