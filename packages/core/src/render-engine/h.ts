import { effect } from "@concertjs/reactivity";
import { ConcertComponent } from "../types";
import { EVENTS, TAG_NAMES } from "../constants";
import { RenderContext, setActiveRenderContext } from "./render-context";
import { replaceChild } from "./lifecycle-hooks";

type Primitive = string | number | boolean | symbol | bigint | undefined;

type Tag = keyof HTMLElementTagNameMap;

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

function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function getNodeHashContent(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    let content = element.tagName;
    for (const attr of Array.from(element.attributes)) {
      content += `${attr.name}=${attr.value};`;
    }
    content += element.textContent || "";
    return content;
  }
  return "";
}

function handleTagElementFunctionChild(element: HTMLElement, child: Function): void {
  let activeKeyNodeMap: Map<number, Node> = new Map();
  let nodeCache: Map<number, Node> = new Map();
  let activeNode: Node | undefined = undefined;

  const stopEffect = effect(() => {
    const childResult = child();

    if (Array.isArray(childResult)) {
      const newOrderedKeys: number[] = [];
      const newActiveKeyNodeMap: Map<number, Node> = new Map();

      childResult.forEach(nestedChild => {
        let nodeKey: number;
        let node: Node;

        if (isNode(nestedChild)) {
          const hashContent = getNodeHashContent(nestedChild);
          nodeKey = hashString(hashContent);

          if (nodeCache.has(nodeKey)) {
            node = nodeCache.get(nodeKey)!;
          } else {
            node = nestedChild;
            nodeCache.set(nodeKey, node);
          }
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
        }
      });

      // Remove nodes that are no longer present
      activeKeyNodeMap.forEach((node, key) => {
        if (newActiveKeyNodeMap.has(key)) return;
        element.removeChild(node);
        nodeCache.delete(key);
      });

      // Reorder nodes to match the new order
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
        element.removeChild(activeNode);
      } else if (activeKeyNodeMap.size) {
        element.innerHTML = "";
        activeKeyNodeMap.clear();
        nodeCache.clear();
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
    if (key === "ref") {
      if (typeof value === "function") {
        value(element);
      } else {
        console.error('Warning: "ref" must be a function. Received:', typeof value);
      }
    } else if (key in EVENTS) {
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

export function h(
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
