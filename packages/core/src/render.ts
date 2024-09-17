import { ConcertComponent } from "./types";

export function render(selector: string, component: ConcertComponent): void {
  const rootRenderFunction = "render" in component ? component.render : component;

  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`No element found for selector ${selector}`);
  }

  const renderedRootComponent = rootRenderFunction();

  element.innerHTML = "";

  const recurse = (layer: any): void => {
    if (Array.isArray(layer)) {
      layer.forEach(child => recurse(child));
    } else if (layer instanceof HTMLElement) {
      element.appendChild(layer);
    } else if (typeof layer === "function") {
      element.appendChild(layer());
    }
  };

  recurse(renderedRootComponent);
}
