import { ConcertComponent } from "../types";

function traverse(layer: JSX.Element, element: HTMLElement): void {
  if (Array.isArray(layer)) {
    layer.forEach(child => traverse(child, element));
  } else if (layer instanceof HTMLElement) {
    element.appendChild(layer);
  } else if (typeof layer === "function") {
    element.appendChild(layer());
  } else {
    throw new Error(`Invalid root layer: ${layer}`);
  }
}

export function mount(selector: string, component: ConcertComponent): void {
  const rootRenderFunction = "render" in component ? component.render : component;

  const element = document.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`No element found for selector ${selector}`);
  }

  const renderedRootComponent: JSX.Element = rootRenderFunction();

  element.innerHTML = "";

  traverse(renderedRootComponent, element);
}
// val was here ;)
