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

  function appendElementWithEffect(
    element: HTMLElement,
    child: () => HTMLElement,
    childResult: HTMLElement
  ) {
    let placeholderNode: HTMLElement = childResult;
    appendNode(element, placeholderNode);

    const stopEffect = effect(() => {
      const newNode = child();
      replaceChild(element, newNode, placeholderNode);
      placeholderNode = newNode;

      return (): void => {
        console.debug("cleanup: appendHTMLElementWithEffect: ", placeholderNode);
        element.removeChild(placeholderNode);
      };
    });

    if (!(element as any).__cleanupFns) {
      (element as any).__cleanupFns = [];
    }
    (element as any).__cleanupFns.push(stopEffect);
  }

  function appendTextNodeWithEffect(
    element: HTMLElement,
    child: () => string,
    childResult: string
  ): void {
    let placeholderNode: Node = document.createTextNode(String(childResult));
    element.appendChild(placeholderNode);

    const stopEffect = effect(() => {
      const effectChildResult = child();
      const newNode = document.createTextNode(String(effectChildResult));
      replaceChild(element, newNode, placeholderNode);
      placeholderNode = newNode;

      return (): void => {
        console.debug("cleanup: appendTextNodeWithEffect: ", placeholderNode);
        element.removeChild(placeholderNode);
      };
    });

    if (!(element as any).__cleanupFns) {
      (element as any).__cleanupFns = [];
    }
    (element as any).__cleanupFns.push(stopEffect);
  }

  function handleTagElementFunctionChild(element: HTMLElement, child: Function): void {
    let childResult: JSX.Element = child();

    if (childResult instanceof Node || childResult instanceof HTMLElement) {
      appendElementWithEffect(element, child as () => HTMLElement, childResult as HTMLElement);
    } else if (typeof childResult === "function") {
      handleTagElementFunctionChild(element, childResult as () => JSX.Element);
    } else if (
      typeof childResult === "string" ||
      typeof childResult === "number" ||
      typeof childResult === "boolean"
    ) {
      appendTextNodeWithEffect(element, child as () => string, childResult as string);
    } else if (Array.isArray(childResult)) {
      childResult.forEach(nestedChild => handleTagElementChild(element, nestedChild));
    } else if (child == null) {
      // Do nothing
    } else {
      console.warn("Unhandled child type:", child);
    }
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
    } else if (child == null) {
      // Do nothing
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
