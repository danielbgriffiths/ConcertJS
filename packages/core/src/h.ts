import { effect, memo, signal } from "./index";
import { ComponentNode, ConcertComponent } from "./types";
import { createUID, ROOT_UID } from "./utils";

export const componentTree = new Map<string, ComponentNode>();
const componentStack = [];

export function createReactiveComponent(
  type: ConcertComponent,
  initialProps: any,
  initialChildren: any[]
) {
  const renderFunction = "render" in type ? type.render : type;

  const [props, setProps] = signal(initialProps ?? {});
  const children = memo(() => initialChildren ?? []);

  let currentElement: HTMLElement | DocumentFragment | null = null;

  const uniqueId = createUID();

  effect(() => {
    const parentUid =
      componentStack.length > 0 ? componentStack[componentStack.length - 1] : ROOT_UID;
    const services = "render" in type ? Object.assign({}, type.services ?? {}) : {};
    const component = {
      uid: uniqueId,
      type,
      props: initialProps,
      children: initialChildren,
      services: services,
      parent: parentUid
    };
    componentTree.set(uniqueId, component);
    componentStack.push(uniqueId);

    const newElement = renderFunction(Object.assign(props() ?? {}, { children: children() }));

    componentStack.pop();

    if (
      currentElement !== newElement &&
      currentElement instanceof HTMLElement &&
      newElement instanceof HTMLElement
    ) {
      currentElement.replaceWith(newElement);
    }

    currentElement = newElement as any;
  });

  return {
    element: currentElement,
    updateProps: (nextProps: Record<string, any>): void => {
      setProps(nextProps);
    }
  };
}

export function h(
  type: ConcertComponent | string,
  props: any,
  ...children: any[]
): HTMLElement | DocumentFragment | string | null {
  console.log("h: ", type, props, children);

  if (typeof type === "function") {
    const componentInstance = createReactiveComponent(type, props, children);

    effect(() => {
      componentInstance.updateProps(props);
    });

    return componentInstance.element;
  }

  const element = document.createElement(type as string);

  if (props) {
    const eventMap: { [k: string]: string } = {
      onClick: "click"
    };

    Object.entries(props).forEach(([key, value]): void => {
      if (key in eventMap) {
        element.addEventListener(
          eventMap[key],
          value as unknown as EventListenerOrEventListenerObject
        );
      } else if (typeof value === "function") {
        effect((): void => {
          element.setAttribute(key, value());
        });
      } else {
        element.setAttribute(key, value as string);
      }
    });
  }

  children.forEach((child): void => {
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else if (typeof child === "function") {
      let childResult = child();

      if (childResult instanceof HTMLElement) {
        const childElement = document.createElement(childResult.tagName);
        childElement.innerHTML = childResult.innerHTML;
        element.appendChild(childElement);
        effect(() => {
          childElement.innerHTML = child().innerHTML;
        });
      } else {
        const textNode = document.createTextNode(childResult);
        element.appendChild(textNode);
        effect(() => {
          textNode.nodeValue = child();
        });
      }
    }
  });

  return element;
}
