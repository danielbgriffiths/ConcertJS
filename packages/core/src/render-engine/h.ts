import { effect } from "@concertjs/reactivity";
import { ConcertComponent } from "../types";
import { EVENTS } from "../constants";
import { RenderContext, setActiveRenderContext } from "./render-context";
import { replaceChild } from "./lifecycle-hooks";

function context() {
  let cleanupFns: Array<() => void> = [];

  function isComponent(componentOrTag: string | ConcertComponent): boolean {
    return typeof componentOrTag === "function";
  }

  function appendTextNode(
    element: HTMLElement,
    textNodeContent: string | number | boolean | object
  ): Text {
    const textNode = document.createTextNode(String(textNodeContent));
    element.appendChild(textNode);
    return textNode;
  }

  function appendNode(element: HTMLElement, child: Node): void {
    element.appendChild(child);
  }

  function handleTagElementFunctionChild(element: HTMLElement, child: Function): void {
    let childResult: JSX.Element = child();

    let placeholderNodeMap: Map<number, Node> = new Map();
    let placeholderNode!: Node;

    if (Array.isArray(childResult)) {
      for (let i = 0; i < childResult.length; i++) {
        if (childResult[i] instanceof Node) {
          placeholderNodeMap.set(i, childResult[i] as Node);
        } else if (
          typeof childResult[i] === "string" ||
          typeof childResult[i] === "number" ||
          typeof childResult[i] === "boolean"
        ) {
          placeholderNodeMap.set(i, document.createTextNode(String(childResult)));
        }
      }

      for (const node of placeholderNodeMap.values()) {
        element.appendChild(node);
      }
    } else {
      if (childResult instanceof Node) {
        placeholderNode = childResult;
      } else if (
        typeof childResult === "string" ||
        typeof childResult === "number" ||
        typeof childResult === "boolean"
      ) {
        placeholderNode = document.createTextNode(String(childResult));
      }

      element.appendChild(placeholderNode);
    }

    const stopEffect = effect(() => {
      childResult = child();

      if (Array.isArray(childResult)) {
        childResult.forEach((nestedChild, i) => {
          if (nestedChild instanceof Node) {
            const newNode = nestedChild;
            replaceChild(element, newNode, placeholderNodeMap.get(i)!);
            placeholderNodeMap.set(i, newNode);
          } else if (
            typeof nestedChild === "string" ||
            typeof nestedChild === "number" ||
            typeof nestedChild === "boolean"
          ) {
            const newNode = document.createTextNode(String(nestedChild));
            replaceChild(element, newNode, placeholderNodeMap.get(i)!);
            placeholderNodeMap.set(i, newNode);
          } else {
            console.warn("Unhandled child type:", child);
          }
        });
      } else {
        if (childResult instanceof Node) {
          const newNode = childResult;
          replaceChild(element, newNode, placeholderNode);
          placeholderNode = newNode;
        } else if (
          typeof childResult === "string" ||
          typeof childResult === "number" ||
          typeof childResult === "boolean"
        ) {
          const newNode = document.createTextNode(String(childResult));
          replaceChild(element, newNode, placeholderNode);
          placeholderNode = newNode;
        } else {
          console.warn("Unhandled child type:", child);
        }
      }

      return (): void => {
        if (placeholderNode) {
          console.debug("cleanup: handleTagElementFunctionChild: ", placeholderNode);
          element.removeChild(placeholderNode);
        } else if (placeholderNodeMap.size) {
          placeholderNodeMap.forEach((node, i) => {
            console.debug("array-cleanup: handleTagElementFunctionChild: ", node);
            element.removeChild(node);
          });
        }
      };
    });

    if (!(element as any).__cleanupFns) {
      (element as any).__cleanupFns = [];
    }
    (element as any).__cleanupFns.push(stopEffect);
  }

  function handleTagElementChild(element: HTMLElement, child: JSX.Element): void {
    if (child instanceof Node) {
      appendNode(element, child);
    } else if (typeof child === "function") {
      handleTagElementFunctionChild(element, child);
    } else if (Array.isArray(child)) {
      child.forEach(nestedChild => handleTagElementChild(element, nestedChild));
    } else if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "boolean"
    ) {
      appendTextNode(element, child);
    } else {
      console.warn("Unhandled child type:", child);
    }
  }

  function handleTagElementChildren(element: HTMLElement, initialChildren: JSX.Element[]): void {
    for (const child of initialChildren) {
      handleTagElementChild(element, child);
    }
  }

  function attachEventHandler(element: HTMLElement, key: string, value: EventListener): void {
    element.addEventListener((EVENTS as any)[key], value);
  }

  function attachEffect(element: HTMLElement, key: string, value: () => any): void {
    const stopEffect = effect(() => {
      const pulledValue = value();

      if (pulledValue == null) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, pulledValue);
      }

      return (): void => {
        element.removeAttribute(key);
      };
    });

    if (!(element as any).__cleanupFns) {
      (element as any).__cleanupFns = [];
    }
    (element as any).__cleanupFns.push(stopEffect);
  }

  function attachAttribute(element: HTMLElement, key: string, value: string): void {
    element.setAttribute(key, value);
  }

  function handleTagElementAttributes(
    element: HTMLElement,
    initialAttributes: Record<string, any>
  ): void {
    for (const [key, value] of Object.entries(initialAttributes)) {
      if (key in EVENTS) {
        attachEventHandler(element, key, value as unknown as EventListener);
      } else if (typeof value === "function") {
        attachEffect(element, key, value);
      } else {
        attachAttribute(element, key, value as string);
      }
    }
  }

  function createComponentElement(
    component: ConcertComponent,
    initialProps: Record<string, any>,
    initialChildren: JSX.Element[]
  ): HTMLElement {
    initialProps["children"] = initialChildren ?? [];

    const componentRenderFn = "render" in component ? component.render : component;

    try {
      const renderContext = new RenderContext();

      setActiveRenderContext(renderContext);

      const nextComponentElement = componentRenderFn(initialProps);

      renderContext.runMounts();

      if ((nextComponentElement as any).__cleanupFns == null) {
        (nextComponentElement as any).__cleanupFns = [];
      }

      (nextComponentElement as any).__cleanupFns.push(() => {
        renderContext.runCleanups();
      });

      return nextComponentElement as HTMLElement;
    } finally {
      setActiveRenderContext(undefined);
    }
  }

  function createTagElement(
    tagName: string,
    initialAttributes: Record<string, any>,
    initialChildren: JSX.Element[]
  ): HTMLElement {
    const element = document.createElement(tagName);
    handleTagElementAttributes(element, initialAttributes);
    handleTagElementChildren(element, initialChildren);
    return element;
  }

  function h(
    componentOrTag: string | ConcertComponent,
    initialProps: Record<string, any>,
    ...initialChildren: JSX.Element[]
  ): HTMLElement {
    if (!initialProps) initialProps = {};
    if (!initialChildren) initialChildren = [];

    if (isComponent(componentOrTag)) {
      return createComponentElement(
        componentOrTag as ConcertComponent,
        initialProps,
        initialChildren
      );
    } else {
      return createTagElement(componentOrTag as string, initialProps, initialChildren);
    }
  }

  h.context = context;

  h.cleanup = (): void => {
    while (cleanupFns.length) {
      const fn = cleanupFns.pop();
      if (typeof fn !== "function") return;
      fn();
    }
  };

  return h;
}

export const h = context();
