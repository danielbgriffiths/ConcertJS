export function render(element: HTMLElement, root): void {
  if (!element || !root) return;

  const rendered = root();

  // Clear the element only once before rendering the component
  element.innerHTML = "";

  const recurse = (layer: any): void => {
    if (Array.isArray(layer)) {
      layer.forEach(child => recurse(child));
    } else if (layer instanceof HTMLElement) {
      console.log("render: appendChild(layer): ", layer);
      element.appendChild(layer);
    } else if (typeof layer === "function") {
      element.appendChild(layer());
    }
  };

  // Recurse through the rendered component and append the resulting element
  recurse(rendered);
}
