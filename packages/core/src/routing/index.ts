import { h } from "../render-engine";
import {
  _ElementDescriptor,
  RouterOptions,
  RouteOptions,
  RouteOptionsWithComponent,
  Router,
  RouteParams,
  RouteQuery,
  RouteNode,
  MatchedRoute,
  ConcertStructuralComponent,
  ConcertFunctionalComponent
} from "../types";
import { ConcertSignalSetter, effect, signal } from "@concertjs/reactivity";
import { refreshDOMHead } from "../decorators/head";

let router: Router | null = null;
const routeTree = {
  children: []
} as unknown as RouteNode;

/**
 * Handles the transition between two routes
 * The callback should actually navigate to the next route
 * @param nextRouteOptions - The next route options
 * @param prevRouteOptions - The previous route options
 * @param callback - The callback to navigate to the next route
 */
async function handleNavigationTransition(
  callback: () => void,
  nextRouteOptions?: RouteOptionsWithComponent,
  prevRouteOptions?: RouteOptionsWithComponent
): Promise<void> {
  if (prevRouteOptions?.beforeLeave) {
    await prevRouteOptions.beforeLeave();
  }

  if (nextRouteOptions?.beforeEntry) {
    await nextRouteOptions.beforeEntry();
  }

  callback();

  if (nextRouteOptions?.afterEntry) {
    nextRouteOptions.afterEntry();
  }

  if (prevRouteOptions?.afterLeave) {
    await prevRouteOptions.afterLeave();
  }
}

/**
 * Creates a router instance
 * The router instance should maintain state and handle navigation
 * It should be the source of truth for the current path
 * @param options - The router options
 * TODO: Right now if the browser opens on a non '/' route it receives a "Cannot GET /<pathname>"
 */
export function routerCreator(options: RouterOptions): Router {
  const [activePath, setActivePath] = signal(
    options.type === "memory" ? "/" : window.location.pathname
  );
  const [params, setParams] = signal<RouteParams>({});
  const [query, setQuery] = signal<RouteQuery>({});
  const [matchedRoutes, setMatchedRoutes] = signal<MatchedRoute[]>([]);

  effect(() => {
    const nextActivePath: string = activePath();
    const routes = matchRoutes(nextActivePath);

    setMatchedRoutes(routes);
    setParams(routes[routes.length - 1]?.params || {});
    setQuery(parsePathQuery(nextActivePath));
  });

  window.addEventListener("popstate", async (): Promise<void> => {
    const nextPath: string = window.location.pathname + window.location.search;

    const nextMatchedRoutes = matchRoutes(nextPath);
    const prevMatchedRoutes = matchRoutes(activePath());

    const nextRouteOptions = nextMatchedRoutes[nextMatchedRoutes.length - 1]?.routeOptions;
    const prevRouteOptions = prevMatchedRoutes[prevMatchedRoutes.length - 1]?.routeOptions;

    await handleNavigationTransition(
      () => setActivePath(nextPath),
      nextRouteOptions,
      prevRouteOptions
    );
  });

  const originalPushState = history.pushState;
  history.pushState = function (...args: any): void {
    originalPushState.apply(history, args);
    window.dispatchEvent(new Event("pushstate"));
  };

  window.addEventListener("pushstate", async (): Promise<void> => {
    const nextPath: string = window.location.pathname + window.location.search;

    const nextMatchedRoutes = matchRoutes(nextPath);
    const prevMatchedRoutes = matchRoutes(activePath());

    const nextRouteOptions = nextMatchedRoutes[nextMatchedRoutes.length - 1]?.routeOptions;
    const prevRouteOptions = prevMatchedRoutes[prevMatchedRoutes.length - 1]?.routeOptions;

    await handleNavigationTransition(
      () => setActivePath(nextPath),
      nextRouteOptions,
      prevRouteOptions
    );
  });

  function parsePathQuery(path: string): RouteQuery {
    const queryObj: RouteQuery = {};
    if (!path) return queryObj;
    const queryString: string = path.split("?")[1];
    if (!queryString) return queryObj;
    queryString.split("&").forEach(part => {
      const [key, value] = part.split("=");
      queryObj[key] = decodeURIComponent(value);
    });
    return queryObj;
  }

  async function navigate(nextPath: string): Promise<void> {
    if (nextPath === activePath()) return;

    const nextMatchedRoutes = matchRoutes(nextPath);
    const prevMatchedRoutes = matchRoutes(activePath());

    const nextRouteOptions = nextMatchedRoutes[nextMatchedRoutes.length - 1]?.routeOptions;
    const prevRouteOptions = prevMatchedRoutes[prevMatchedRoutes.length - 1]?.routeOptions;

    await handleNavigationTransition(
      () => {
        history.pushState(null, "", nextPath);
        setActivePath(nextPath);
      },
      nextRouteOptions,
      prevRouteOptions
    );
  }

  return {
    activePath,
    navigate,
    params,
    query,
    matchedRoutes
  };
}

/**
 * Finds all routes that match the current path, starting at the root of the route tree
 * @param path - The current path
 */
function matchRoutes(path: string): MatchedRoute[] {
  const segments = path.startsWith("/") ? path.slice(1).split("/") : path.split("/");
  const matchedRoutes: MatchedRoute[] = [];
  let params: RouteParams = {};
  let currentNode = routeTree;

  for (const segment of segments) {
    let childNode = currentNode.children.find(child => {
      return child.pathSegment === segment;
    });

    if (!childNode) {
      childNode = currentNode.children.find(child => {
        return child.pathSegment.startsWith(":");
      });
    }

    if (!childNode) {
      break;
    }

    if (childNode.pathSegment.startsWith(":")) {
      const paramName = childNode.pathSegment.slice(1);
      params[paramName] = segment;
    }

    if (childNode.routeOptions) {
      matchedRoutes.push({
        routeOptions: childNode.routeOptions,
        params: { ...params }
      });
    }

    currentNode = childNode;
  }

  return matchedRoutes;
}

/**
 * Component that renders the active route at the current path layer
 * TODO (low): Async props resolution should work with fine-grained-reactivity instead of full DOM re-rendering
 * TODO (critical): Fix infinite loop when navigating to nested route, revert to old impl. Move routeLevel out to global state. Simplify effect use
 */
export function RouteOutlet() {
  if (!router) {
    throw new Error("Router not found in RouteOutlet component context.");
  }

  let routeLevel: number = 0;
  let previousMatchedRoute!: MatchedRoute;

  return function renderView() {
    const matchedRoutes = router!.matchedRoutes();
    const matchedRoute = matchedRoutes[routeLevel];

    if (!matchedRoute) {
      return null;
    }

    const [props, setProps] = signal<Record<string, any>>({});

    handleProps(matchedRoute.routeOptions.path, matchedRoute.routeOptions.props, setProps);

    const componentRenderFn: ConcertFunctionalComponent =
      (matchedRoute.routeOptions.component as ConcertStructuralComponent).render ||
      (matchedRoute.routeOptions.component as ConcertFunctionalComponent);

    function wrappedRender(p: any, c: any) {
      routeLevel++;
      const content = componentRenderFn(p, c);
      routeLevel--;
      return content;
    }

    // refreshDOMHead(
    //   matchedRoute.routeOptions.className,
    //   previousMatchedRoute.routeOptions?.className
    // );

    previousMatchedRoute = matchedRoute;

    return h(wrappedRender, props());
  };
}

function handleProps(
  pathUid: string,
  nextProps: RouteOptions["props"],
  setProps: ConcertSignalSetter
): void {
  if (typeof nextProps === "function") {
    const result = nextProps();
    if (result instanceof Promise) {
      setProps({ isLoading: true });
      result.then(resolvedProps => {
        if (pathUid !== router!.activePath()) return;
        setProps({ ...resolvedProps, isLoading: false });
      });
    } else {
      setProps(result);
    }
  } else {
    setProps(nextProps ?? {});
  }
}

// export function RouteOutlet() {
//   let previousMatchedRoute!: MatchedRoute;
//
//   if (!router) {
//     throw new Error("Router not found in RouteOutlet component context.");
//   }
//
//   let routeLevel = 0;
//
//   const [activeRoute, setActiveRoute] = signal<MatchedRoute>(router!.matchedRoutes()[routeLevel]);
//   const [props, setProps] = signal<Record<string, any>>({});
//
//   effect(() => {
//     setActiveRoute(router!.matchedRoutes()[routeLevel]);
//   });
//
//   effect(() => {
//     const matchedRoute = activeRoute();
//
//     console.log(
//       "matchedRoute: ",
//       matchedRoute.routeOptions.path,
//       matchedRoute.routeOptions.className
//     );
//
//     handleProps(matchedRoute.routeOptions.path, matchedRoute.routeOptions.props);
//
//     refreshDOMHead(
//       matchedRoute.routeOptions.className,
//       previousMatchedRoute?.routeOptions?.className
//     );
//
//     previousMatchedRoute = matchedRoute!;
//   });
//
//   function handleProps(pathUid: string, nextProps: RouteOptions["props"]): void {
//     if (typeof nextProps === "function") {
//       const result = nextProps();
//       if (result instanceof Promise) {
//         setProps({ isLoading: true });
//         result.then(resolvedProps => {
//           if (pathUid !== router!.activePath()) return;
//           setProps({ ...resolvedProps, isLoading: false });
//         });
//       } else {
//         setProps(result);
//       }
//     } else {
//       setProps(nextProps ?? {});
//     }
//   }
//
//   return () => h(activeRoute().routeOptions.component ?? "template", props());
// }

/**
 * Inserts a route into the route tree
 * @param path - The path to insert
 * @param routeOptions - The route options
 */
function insertRoute(path: string, routeOptions: RouteOptionsWithComponent): void {
  const segments = path.startsWith("/") ? path.slice(1).split("/") : path.split("/");
  let currentNode = routeTree;

  for (const segment of segments) {
    let childNode = currentNode.children.find(child => child.pathSegment === segment);
    if (!childNode) {
      childNode = {
        pathSegment: segment,
        children: []
      };
      currentNode.children.push(childNode);
    }
    currentNode = childNode;
  }

  currentNode.routeOptions = routeOptions;
}

/**
 * Decorator that registers a route on a page component
 * @param options - The route options
 */
export function Route<P extends Record<string, any>>(options: RouteOptions<P>) {
  return function (element: _ElementDescriptor) {
    if (element.kind !== "class") return element;

    return {
      ...element,
      finisher(cls: FunctionConstructor): void {
        const renderFn = element.elements.find(el => el.key === "render")?.descriptor.value;

        if (!renderFn) {
          console.warn("Unable to find render function in component");
        }

        const routeOptionsWithComponent = { ...options, component: renderFn, className: cls.name };

        insertRoute(options.path, routeOptionsWithComponent);
      }
    };
  };
}

/**
 * Decorator that initializes the router
 * @param options - The router options
 */
export function WithRouter(options: RouterOptions) {
  return function (): void {
    if (router) {
      console.error("WithRouter: Router already initialized");
      return;
    }

    router = routerCreator(options);
  };
}

/**
 * Decorator that injects the router into a component
 * @param element - The element descriptor
 */
export function UseRouter(element: _ElementDescriptor) {
  const originalMethod = element.descriptor.value;

  element.descriptor.value = function (props: any, context: any = {}, ...args: any[]) {
    context.router = router;
    return originalMethod.call(this, props, context, ...args);
  };
}

/**
 * Component that renders an anchor tag and navigates to the href when clicked
 */
export class Link {
  static render(props: Record<string, any>, context: Record<string, any>) {
    if (!router) {
      throw new Error("Router not found in Link component context.");
    }

    function onClickLink(e: MouseEvent): void {
      e.preventDefault();
      router!.navigate(props.href);
    }

    return h("a", { href: props.href, onClick: onClickLink }, ...props.children);
  }
}
