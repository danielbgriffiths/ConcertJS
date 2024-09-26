import { effect, memo } from "@concertjs/reactivity";
import { ConcertComponent } from "../types";
import { EVENTS } from "../constants";

type CreateComponentElementReturn = {
  element: HTMLElement;
};

type CreateTagElementReturn = {
  element: HTMLElement;
};

function context() {
  let cleanupFns: Array<() => void> = [];

  function isComponent(componentOrTag) {
    return typeof componentOrTag === "function";
  }

  function shouldReplaceComponentElement(componentElement, nextComponentElement) {
    return (
      componentElement !== nextComponentElement &&
      componentElement instanceof HTMLElement &&
      nextComponentElement instanceof HTMLElement
    );
  }

  function createComponentElement(
    component: ConcertComponent,
    initialProps: Record<string, any>,
    initialChildren: JSX.Element
  ): CreateComponentElementReturn {
    const mergedProps = memo(() => ({
      ...(initialProps ?? {}),
      children: initialChildren ?? []
    }));

    const componentRenderFn = "render" in component ? component.render : component;

    let componentElement!: HTMLElement;

    const stopEffect = effect(() => {
      const nextProps = mergedProps();
      const nextComponentElement = componentRenderFn(nextProps);

      if (shouldReplaceComponentElement(componentElement, nextComponentElement)) {
        componentElement.replaceWith(nextComponentElement as HTMLElement);
      }

      return () => {
        componentElement.remove();
      };
    });

    cleanupFns.push(stopEffect);

    return {
      element: componentElement
    };
  }

  function createTagElement(
    tagName: string,
    initialAttributes: Record<string, any>,
    initialChildren: JSX.Element[]
  ): CreateTagElementReturn {
    const element = document.createElement(tagName);

    function attachEventHandler(key, value): void {
      element.addEventListener((EVENTS as any)[key], value as unknown as EventListener);
    }

    function attachEffect(key, value): void {
      effect((): void => {
        const pulledValue = value();

        if (pulledValue == null) {
          element.removeAttribute(key);
        } else {
          element.setAttribute(key, pulledValue);
        }
      });
    }

    function attachAttribute(key, value): void {
      element.setAttribute(key, value as string);
    }

    for (const [key, value] of Object.entries(initialAttributes)) {
      if (key in EVENTS) {
        attachEventHandler(key, value);
      } else if (typeof value === "function") {
        attachEffect(key, value);
      } else {
        attachAttribute(key, value);
      }
    }

    function appendTextNode(child: string | number): void {
      element.appendChild(document.createTextNode(String(child)));
    }

    function appendNode(child: Node): void {
      element.appendChild(child);
    }

    function handleFunctionChild(child: () => JSX.Element): void {
      function appendHTMLElement(htmlElementChild: () => HTMLElement, childResult: HTMLElement) {
        let clonedChild = childResult.cloneNode(true) as HTMLElement;
        element.appendChild(clonedChild);

        effect(() => {
          const updatedClonedChild = htmlElementChild().cloneNode(true) as HTMLElement;
          element.replaceChild(updatedClonedChild, clonedChild);
          clonedChild = updatedClonedChild;
        });
      }

      function appendTextNode(textNodeChild: () => string, childResult: string): void {
        const textNode = document.createTextNode(childResult);
        element.appendChild(textNode);
        effect(() => {
          textNode.nodeValue = textNodeChild();
        });
      }

      let childResult = child();

      if (childResult instanceof HTMLElement) {
        appendHTMLElement(child as () => HTMLElement, childResult);
      } else {
        appendTextNode(child as () => string, childResult as string);
      }
    }

    for (const child of initialChildren) {
      if (typeof child === "string" || typeof child === "number") {
        appendTextNode(child);
      } else if (child instanceof Node) {
        appendNode(child);
      } else if (typeof child === "function") {
        handleFunctionChild(child);
      }
    }

    return { element };
  }

  function h(
    componentOrTag: string | ConcertComponent,
    initialProps: Record<string, any>,
    initialChildren: JSX.Element
  ): HTMLElement {
    if (!initialProps) {
      initialProps = {};
    }

    if (!initialChildren) {
      initialChildren = [];
    }

    if (isComponent(componentOrTag)) {
      const componentElement = createComponentElement(
        componentOrTag as ConcertComponent,
        initialProps,
        initialChildren
      );
      return componentElement.element;
    }

    const tagElement = createTagElement(componentOrTag as string, initialProps, initialChildren);
    return tagElement.element;
  }

  h.context = context;

  h.cleanup = (): void => {
    while (cleanupFns.length) {
      const fn = cleanupFns.pop();
      fn();
    }
  };

  return h;
}

export const h = context();
