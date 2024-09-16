import { effect, memo, signal } from "./index";

function createReactiveComponent(type, initialProps: any, initialChildren: any[]) {
  const [props, setProps] = signal(initialProps ?? {});
  const children = memo(() => initialChildren ?? []);

  let currentElement: HTMLElement | DocumentFragment | null = null;

  effect(() => {
    const newElement = type(Object.assign(props(), { children: children() }));

    if (
      currentElement !== newElement &&
      currentElement instanceof HTMLElement &&
      newElement instanceof HTMLElement
    ) {
      currentElement.replaceWith(newElement);
    }

    currentElement = newElement as any;
  });

  currentElement = type(Object.assign(props(), { children: children() })) as any;

  return {
    element: currentElement,
    updateProps: (nextProps: any) => {
      setProps(nextProps);
    }
  };
}

export function h(
  type,
  props: any,
  ...children: any[]
): HTMLElement | DocumentFragment | string | null {
  console.log("h: ", type, props, children);

  if (typeof type === "function") {
    const componentInstance = createReactiveComponent(type as any, props, children);

    // Monitor prop changes and update them reactively, but avoid unnecessary re-renders
    effect(() => {
      componentInstance.updateProps(props);
    });

    return componentInstance.element;
  }

  // Handle standard HTML elements
  const element = document.createElement(type);

  // Set up attributes and events
  if (props) {
    const eventMap: { [k: string]: string } = {
      onClick: "click"
    };

    Object.entries(props).forEach(([key, value]): void => {
      if (key in eventMap) {
        const event = key.toLowerCase() as keyof HTMLElementEventMap;
        element.addEventListener(
          eventMap[key],
          value as unknown as EventListenerOrEventListenerObject
        );
      } else if (typeof value === "function") {
        effect(() => {
          element.setAttribute(key, value());
        });
      } else {
        element.setAttribute(key, value as string);
      }
    });
  }

  // Handle children
  children.forEach((child): void => {
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else if (typeof child === "function") {
      const textNode = document.createTextNode(child());
      element.appendChild(textNode);
      effect(() => {
        textNode.nodeValue = child();
      });
    }
  });

  return element;
}
