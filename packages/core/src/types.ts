export type ConcertSignalGetter<T = any> = () => T;

export type ConcertSignalSetter<T = any> = (nextValue: T | ((previous: T) => void)) => void;

export type ConcertSignal<T = any> = [ConcertSignalGetter<T>, ConcertSignalSetter<T>];

export type ConcertEffectFn = () => void | (() => void);

export type ConcertInstance = {};

export declare class ConcertStructuralComponent {
  services?: ComponentServices;
  render<P = any>(): ConcertFunctionalComponent<P>;
}

export type ConcertFunctionalComponent<P = any> = (
  props?: P,
  instance?: ConcertInstance
) => JSX.Element;

export type ConcertComponent<P = any> = ConcertStructuralComponent | ConcertFunctionalComponent<P>;

export type ComponentServices = { [key: string]: Function };

export interface ComponentNode {
  uid: string;
  type: ConcertComponent;
  props: Record<string, any>;
  children: string[];
  services: ComponentServices;
  parent: string;
}

export interface ComponentPropsWithChildren {
  children?: JSX.Element | JSX.Element[];
}

export interface LinkProps extends ComponentPropsWithChildren {
  href?: string;
}
