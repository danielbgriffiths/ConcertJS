import { h } from "../render-engine";
import {
  _ElementDescriptor,
  RouterOptions,
  RouteOptions,
  RouteOptionsWithComponent,
  Router,
  RouteParams,
  RouteQuery,
  ConcertSignal,
  ConcertComponent
} from "../types";
import { ConcertSignalSetter, effect, memo, signal } from "@concertjs/reactivity";
import { refreshDOMHead } from "../decorators/head";

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

  effect(() => {
    const nextActivePath: string = activePath();
    const nextQuery: RouteQuery = parsePathQuery(nextActivePath);
    const nextParams: RouteParams = parsePathParams(nextActivePath);
    setQuery(nextQuery);
    setParams(nextParams);
  });

  window.addEventListener("popstate", async (): Promise<void> => {
    const nextPath: string = window.location.pathname + window.location.search;
    await handleNavigationTransition(
      () => setActivePath(nextPath),
      findMatchingRoute(nextPath),
      routeRegistry.get(activePath())
    );
  });

  const originalPushState = history.pushState;
  history.pushState = function (...args: any): void {
    originalPushState.apply(history, args);
    window.dispatchEvent(new Event("pushstate"));
  };

  window.addEventListener("pushstate", async (): Promise<void> => {
    const nextPath: string = window.location.pathname + window.location.search;
    await handleNavigationTransition(
      () => setActivePath(nextPath),
      findMatchingRoute(nextPath),
      routeRegistry.get(activePath())
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

  function parsePathParams(path: string): RouteParams {
    const paramsObj: RouteParams = {};
    if (!path) return paramsObj;
    const routeParts = path.split("/");
    const pathParts = activePath().split("?")[0].split("/");
    routeParts.forEach((part, index) => {
      if (!part.startsWith(":")) return;
      const paramName = part.substring(1);
      paramsObj[paramName] = pathParts[index];
    });
    return paramsObj;
  }

  async function navigate(nextPath: string): Promise<void> {
    if (nextPath === activePath()) return;

    await handleNavigationTransition(
      () => {
        history.pushState(null, "", nextPath);
        setActivePath(nextPath);
      },
      routeRegistry.get(nextPath),
      routeRegistry.get(activePath())
    );
  }

  return {
    activePath,
    navigate,
    params,
    query
  };
}

let router: Router | null = null;
const routeRegistry = new Map<string, RouteOptionsWithComponent>();

/**
 * Finds the route that best matches the active path
 * Should consider dynamic parameters
 * Should fall back to the known not-found path
 * @param activePath - The current path
 */
function findMatchingRoute(activePath: string): RouteOptionsWithComponent {
  type PathObject = {
    path: string;
    parts: string[];
  };

  function getURLParts(url: string): string[] {
    if (url === "/") return [""];
    if (url.startsWith("/")) url = url.slice(1);
    if (url.endsWith("/")) url = url.slice(0, url.length - 1);
    return url.split("/");
  }

  const pathObjects: PathObject[] = Array.from(routeRegistry.keys()).map(
    (path: string): PathObject => ({
      parts: getURLParts(path),
      path
    })
  );
  const hrefParts: string[] = getURLParts(activePath.split("?")[0]);

  if (hrefParts.length === 1 && hrefParts.at(0) === "") {
    return routeRegistry.get("/") ?? routeRegistry.get("*")!;
  }

  for (const pathObject of pathObjects) {
    if (pathObject.parts.join("") === hrefParts.join("")) {
      return routeRegistry.get(pathObject.path) ?? routeRegistry.get("*")!;
    }
  }

  const possibleMatches: Set<PathObject> = new Set<PathObject>();

  for (const pathObject of pathObjects) {
    if (pathObject.parts.length === hrefParts.length) {
      possibleMatches.add(pathObject);
    }
  }

  for (const possibleMatch of possibleMatches) {
    for (let i = 0; i < possibleMatch.parts.length; i++) {
      if (possibleMatch.parts[i] !== hrefParts[i] && !possibleMatch.parts[i].startsWith(":")) {
        possibleMatches.delete(possibleMatch);
      }
    }
  }

  const match: PathObject | undefined = Array.from(possibleMatches).sort().pop();

  return routeRegistry.get(match?.path ?? "*")!;
}

/**
 * Component that renders the active route at the current path layer
 * TODO: This should support nested outlets. ie. App(RouteOutlet) -> view Dashboard(RouteOutlet) -> sub-view DashboardOverview
 * TODO: Async props resolution should work with fine-grained-reactivity instead of full DOM re-rendering
 */
export function RouteOutlet() {
  let previousRouteOptions!: RouteOptionsWithComponent;

  if (!router) {
    throw new Error("Router not found in RouteOutlet component context.");
  }

  const activeRoute = memo<RouteOptionsWithComponent>(() =>
    findMatchingRoute(router!.activePath())
  );
  const [props, setProps] = signal<Record<string, any>>({});

  effect(() => {
    const activeRouteOptions = activeRoute();

    handleProps(activeRouteOptions.path, activeRouteOptions.props);

    refreshDOMHead(activeRouteOptions.className, previousRouteOptions?.className);

    previousRouteOptions = activeRouteOptions!;
  });

  function handleProps(pathUid: string, nextProps: RouteOptions["props"]): void {
    if (typeof nextProps === "function") {
      const result = nextProps();
      if (result instanceof Promise) {
        setProps({});
        result.then(resolvedProps => {
          if (pathUid !== router!.activePath()) return;
          setProps(resolvedProps);
        });
      } else {
        setProps(result);
      }
    } else {
      setProps(nextProps ?? {});
    }
  }

  return () => h(activeRoute().component ?? "template", props());
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
        if (routeRegistry.has(options.path)) {
          console.warn(`${cls.name} route for path "${options.path}" is already registered.`);
          return;
        }

        const renderFn = element.elements.find(el => el.key === "render")?.descriptor.value;

        if (!renderFn) {
          console.warn("Unable to find render function in component");
        }

        routeRegistry.set(options.path, { ...options, component: renderFn, className: cls.name });
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
