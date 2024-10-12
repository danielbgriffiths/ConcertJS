import { ConcertComponent } from "../types";
import { observeCleanupLifecycle } from "./lifecycle-hooks";
import { RenderContext, setActiveRenderContext } from "./render-context";
import { seedDefaultHeadOptions } from "../decorators/head";

function traverse(layer: JSX.Element, element: HTMLElement): void {
  if (Array.isArray(layer)) {
    layer.forEach(child => traverse(child, element));
  } else if (layer instanceof HTMLElement) {
    element.appendChild(layer);
  } else if (typeof layer === "function") {
    element.appendChild((layer as Function)());
  } else {
    throw new Error(`Invalid root layer: ${layer}`);
  }
}

type ConcertConfig = {
  modules?: any[];
  directives?: any[];
  stores?: any[];
  services?: any[];
};

export function mount(selector: string, component: ConcertComponent, _config: ConcertConfig): void {
  const rootRenderFunction = "render" in component ? component.render : component;

  const element = document.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`No element found for selector ${selector}`);
  }

  seedDefaultHeadOptions();

  let renderedRootComponent!: JSX.Element;

  try {
    const renderContext = new RenderContext();

    setActiveRenderContext(renderContext);

    renderedRootComponent = rootRenderFunction();

    renderContext.runMounts();

    if ((renderedRootComponent as any).__cleanupFns == null) {
      (renderedRootComponent as any).__cleanupFns = [];
    }

    (renderedRootComponent as any).__cleanupFns.push(() => {
      renderContext.runCleanups();
    });
  } finally {
    setActiveRenderContext(undefined);

    element.innerHTML = "";

    traverse(renderedRootComponent, element);

    observeCleanupLifecycle();
  }
}
// val was here ;)
