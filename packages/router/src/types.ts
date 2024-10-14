import { ConcertComponent } from "@concertjs/core";

type MaybePromise<V = any> = Promise<V> | V;

export type RouteOptions<P extends Record<string, any> = {}> = {
  path: string;
  element: ConcertComponent<P>;
  exact?: boolean;
  props?: P | ((context: any) => MaybePromise<P>);
  children?: RouteOptions[];
};

export type AsyncImport<T> = () => Promise<T>;
