import { ConcertComponent } from "./types";
import { componentTree } from "./h";
import { ROOT_UID } from "./utils";

function recursivelyMount(layer: any, element: HTMLElement): void {
  if (Array.isArray(layer)) {
    layer.forEach(child => recursivelyMount(child, element));
  } else if (layer instanceof HTMLElement) {
    element.appendChild(layer);
  } else if (typeof layer === "function") {
    element.appendChild(layer());
  }
}

export function render(selector: string, component: ConcertComponent): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`No element found for selector ${selector}`);
  }

  const rootRenderFunction = "render" in component ? component.render : component;
  const renderedRootComponent = rootRenderFunction();

  componentTree.set(ROOT_UID, {
    uid: ROOT_UID,
    type: component,
    props: {},
    children: [],
    services: "render" in component ? Object.assign({}, component.services ?? {}) : {},
    parent: null
  });

  console.log("componentTree: ", componentTree);

  element.innerHTML = "";
  recursivelyMount(renderedRootComponent, element);
}
