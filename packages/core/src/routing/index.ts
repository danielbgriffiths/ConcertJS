import { h } from "../render-engine";
import {
  _ElementDescriptor,
  RouterOptions,
  RouteOptions,
  RouteOptionsWithComponent,
  Router
} from "../types";
import { memo, signal } from "@concertjs/reactivity";

export function routerFactory(options: RouterOptions): Router {
  const [activePath, setActivePath] = signal(
    options.type === "memory" ? "/" : window.location.pathname
  );

  const navigate = async (path: string): Promise<void> => {
    if (path === activePath()) return;

    const prevRouteOptions = routeRegistry.get(activePath());
    const nextRouteOptions = routeRegistry.get(path);

    if (prevRouteOptions?.beforeLeave) {
      await prevRouteOptions.beforeLeave();
    }

    if (nextRouteOptions?.beforeEntry) {
      await nextRouteOptions.beforeEntry();
    }

    history.pushState(null, "", path);
    setActivePath(path);

    if (nextRouteOptions?.afterEntry) {
      nextRouteOptions.afterEntry();
    }

    if (prevRouteOptions?.afterLeave) {
      await prevRouteOptions.afterLeave();
    }
  };

  window.addEventListener("popstate", () => {
    setActivePath(window.location.pathname);
  });

  return {
    activePath,
    navigate
  };
}

let router: Router | null = null;
const routeRegistry = new Map<string, RouteOptionsWithComponent>();

export function RouteOutlet(props: Record<string, any>, context: Record<string, any>) {
  if (!router) {
    throw new Error("Router not found in RouteOutlet component context.");
  }

  const currentComponent = memo(() => {
    const routeOptions = routeRegistry.get(router!.activePath());

    if (routeOptions?.beforeRender) {
      routeOptions.beforeRender();
    }

    if (routeOptions?.component) {
      return h(routeOptions.component!, {});
    } else if (routeOptions!.fallbackPage) {
      return h(routeOptions!.fallbackPage, {});
    } else {
      return h("div", {}, "Page not found");
    }
  });

  return () => currentComponent();
}

export function Route<P extends Record<string, any>>(options: RouteOptions<P>) {
  return function (component: _ElementDescriptor): void {
    if (!routeRegistry.has(options.path)) {
      const renderFn = component.elements.find(el => el.key === "render")?.descriptor.value;
      if (!renderFn) {
        console.warn("Unable to find render function in component");
      }
      routeRegistry.set(options.path, { ...options, component: renderFn });
    } else {
      console.warn(`${options.name} route for path "${options.path}" is already registered.`);
    }
  };
}

export function WithRouter(options: RouterOptions) {
  return function (): void {
    if (router) {
      console.error("WithRouter: Router already initialized");
      return;
    }

    router = routerFactory(options);
  };
}

export function UseRouter(element: _ElementDescriptor) {
  const originalMethod = element.descriptor.value;

  element.descriptor.value = function (props: any, context: any, ...args: any[]) {
    if (!context) {
      context = {};
    }

    context.router = router;

    return originalMethod.call(this, props, context, ...args);
  };
}

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
