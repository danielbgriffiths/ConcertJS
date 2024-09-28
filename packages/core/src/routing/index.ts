export class ConcertRouter {
  constructor() {}
}

export function Route(path: string) {
  return function (constructor: Function) {
    console.log("Route CONSTRUCTOR: ", constructor);
  };
}

export function ConcertRouteSlot(props: Record<string, any>): JSX.Element {
  return props.children;
}
