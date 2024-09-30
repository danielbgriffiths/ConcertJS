import { effect } from "@concertjs/reactivity";
import { ConcertComponent } from "../types";
import { EVENTS, TAG_NAMES } from "../constants";
import { RenderContext, setActiveRenderContext } from "./render-context";
import { replaceChild } from "./lifecycle-hooks";

type Primitive = string | number | boolean | symbol | bigint | undefined;

type Tag = keyof HTMLElementTagNameMap;

function context() {
  let cleanupFns: Array<() => void> = [];

  function getRenderFn(component: ConcertComponent): Function {
    return "render" in component ? component.render : component;
  }

  function isPrimitive(value: any): value is Primitive {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "symbol" ||
      typeof value === "bigint" ||
      typeof value === "undefined"
    );
  }

  function isNode(value: any): value is Node {
    return value instanceof Node;
  }

  function isFunction(value: any): value is Function {
    return typeof value === "function";
  }

  function isArrayOfNodes(value: any): value is Array<Node> {
    return Array.isArray(value) && value.every(isNode);
  }

  function isComponent(componentOrTag: Tag | ConcertComponent): componentOrTag is ConcertComponent {
    return typeof componentOrTag === "function";
  }

  function isTag(componentOrTag: Tag | ConcertComponent): componentOrTag is Tag {
    return typeof componentOrTag === "string" && TAG_NAMES.has(componentOrTag);
  }

  function appendTextNode(element: HTMLElement, textNodeContent: Primitive): Text {
    const textNode = document.createTextNode(String(textNodeContent));
    element.appendChild(textNode);
    return textNode;
  }

  function appendNode(element: HTMLElement, child: Node): void {
    element.appendChild(child);
  }

  function handleTagElementFunctionChild(element: HTMLElement, child: Function): void {
    let keyCounter: number = 0;
    let activeKeyNodeMap: Map<number, Node> = new Map();
    let nodeToKeyMap: WeakMap<Node, number> = new WeakMap();
    let activeNode: Node | undefined = undefined;

    const stopEffect = effect(() => {
      const childResult = child();

      if (isArrayOfNodes(childResult)) {
        const newOrderedKeys: number[] = [];
        const newActiveKeyNodeMap: Map<number, Node> = new Map();

        childResult.forEach((nestedChild, i) => {
          let nodeKey: number;
          let node: Node;

          if (isNode(nestedChild)) {
            if (nodeToKeyMap.has(nestedChild)) {
              nodeKey = nodeToKeyMap.get(nestedChild)!;
            } else {
              nodeKey = keyCounter++;
              nodeToKeyMap.set(nestedChild, nodeKey);
            }
            node = nestedChild;
          } else {
            console.warn("Child of array must be a valid Node. Invalid child:", nestedChild);
            return;
          }

          newOrderedKeys.push(nodeKey);

          if (activeKeyNodeMap.has(nodeKey)) {
            const existingNode = activeKeyNodeMap.get(nodeKey)!;

            if (existingNode !== node) {
              replaceChild(element, node, existingNode);
            }

            newActiveKeyNodeMap.set(nodeKey, node);
          } else {
            element.appendChild(node);
            newActiveKeyNodeMap.set(nodeKey, node);

            if (node instanceof HTMLElement) {
              node.setAttribute("concert-key", nodeKey.toString());
            }
          }

          if (isNode(node)) {
            nodeToKeyMap.set(node, nodeKey);
          }
        });

        activeKeyNodeMap.forEach((node, key) => {
          if (!newActiveKeyNodeMap.has(key)) {
            console.debug("Removing node with key:", key);
            element.removeChild(node);
            if (node instanceof HTMLElement) {
              node.removeAttribute("concert-key");
            }
            if (isNode(node)) {
              nodeToKeyMap.delete(node);
            }
          }
        });

        newOrderedKeys.forEach((key, index) => {
          const node = newActiveKeyNodeMap.get(key)!;
          const currentNode = element.childNodes[index];
          if (currentNode !== node) {
            element.insertBefore(node, currentNode);
          }
        });

        activeKeyNodeMap = newActiveKeyNodeMap;
      } else {
        if (isNode(childResult)) {
          const nextNode = childResult;
          if (nextNode !== activeNode) {
            replaceChild(element, nextNode, activeNode);
            activeNode = nextNode;
          }
        } else if (isPrimitive(childResult)) {
          const nextNode = document.createTextNode(String(childResult));
          if (nextNode !== activeNode) {
            replaceChild(element, nextNode, activeNode);
            activeNode = nextNode;
          }
        } else {
          console.warn("Child must be primitive or node. Child is not primitive or node: ", child);
        }
      }

      return (): void => {
        if (activeNode) {
          console.debug("cleanup: handleTagElementFunctionChild: ", activeNode);
          element.removeChild(activeNode);
        } else if (activeKeyNodeMap.size) {
          activeKeyNodeMap.forEach((node, key) => {
            console.debug("cleanup: handleTagElementFunctionChild: Removing node with key:", key);
            element.removeChild(node);
            if (node instanceof HTMLElement) {
              node.removeAttribute("concert-key");
            }
            if (isNode(node)) {
              nodeToKeyMap.delete(node);
            }
          });
          activeKeyNodeMap.clear();
        }
      };
    });

    if (!(element as any).__cleanupFns) {
      (element as any).__cleanupFns = [];
    }
    (element as any).__cleanupFns.push(stopEffect);
  }

  function handleTagElementChild(element: HTMLElement, child: JSX.Element): void {
    if (isNode(child)) {
      appendNode(element, child);
    } else if (isFunction(child)) {
      handleTagElementFunctionChild(element, child);
    } else if (isArrayOfNodes(child)) {
      child.forEach(nestedChild => handleTagElementChild(element, nestedChild));
    } else if (isPrimitive(child)) {
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

      if (!pulledValue) {
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
      } else if (isFunction(value)) {
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

    const componentRenderFn = getRenderFn(component);

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
    tagName: Tag,
    initialAttributes: Record<string, any>,
    initialChildren: JSX.Element[]
  ): HTMLElement {
    const element = document.createElement(tagName);
    handleTagElementAttributes(element, initialAttributes);
    handleTagElementChildren(element, initialChildren);
    return element;
  }

  function h(
    componentOrTag: Tag | ConcertComponent,
    initialProps: Record<string, any>,
    ...initialChildren: JSX.Element[]
  ): HTMLElement | void {
    if (!initialProps) initialProps = {};
    if (!initialChildren) initialChildren = [];

    if (isComponent(componentOrTag)) {
      return createComponentElement(componentOrTag, initialProps, initialChildren);
    }

    if (isTag(componentOrTag)) {
      return createTagElement(componentOrTag, initialProps, initialChildren);
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
