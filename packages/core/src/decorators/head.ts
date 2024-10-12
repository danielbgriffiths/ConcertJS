import { _ElementDescriptor, HeadOptions, HeadOptionsWithCache } from "../types";

/**
 * Map of page component class names to their head options and node cache.
 */
const pageHeadOptionsMap = new Map<string, HeadOptionsWithCache>();

/**
 * Default head options for a page component.
 * This should be generated at the start of the application and should be used as a fallback.
 */
const defaultHeadOptions = { nodeCache: new Map() } as HeadOptionsWithCache;

/**
 * Decorator that allows for the registration of DOM head options for a page component.
 * @param options - The head options for the page component
 * @constructor - The class decorator
 */
export function Head(options: HeadOptions) {
  return function (element: _ElementDescriptor) {
    if (element.kind !== "class") return element;

    return {
      ...element,
      finisher(cls: FunctionConstructor): void {
        const className = cls.name;
        pageHeadOptionsMap.set(className, {
          ...options,
          nodeCache: new Map()
        });
      }
    };
  };
}

/**
 * Should apply head options for next page to DOM.
 * If the nodeCache is seeded we should apply the nodes from the cache preferentially.
 * If the nodeCache is not seeded we should apply the head options to the DOM and seed the cache.
 * @param nextPageHeadOptions - The head options for the next page
 */
function applyDOMHead(nextPageHeadOptions: HeadOptionsWithCache): void {
  if (nextPageHeadOptions.nodeCache.has("title")) {
    const node = nextPageHeadOptions.nodeCache.get("title") as HTMLElement;
    document.head.appendChild(node);
  } else if (nextPageHeadOptions.title) {
    const existingTitle = document.head.querySelector("title");
    if (existingTitle) {
      document.head.removeChild(existingTitle);
    }

    const title = document.createElement("title");
    title.textContent = nextPageHeadOptions.title;
    document.head.appendChild(title);
    nextPageHeadOptions.nodeCache.set("title", title);
  }

  if (nextPageHeadOptions.nodeCache.has("meta")) {
    for (const node of nextPageHeadOptions.nodeCache.get("meta") as HTMLElement[]) {
      document.head.appendChild(node);
    }
  } else if (nextPageHeadOptions.meta?.length) {
    let nodeCache: HTMLElement[] = [];
    for (const meta of nextPageHeadOptions.meta) {
      const node = document.createElement("meta");
      for (const [key, value] of Object.entries(meta)) {
        node.setAttribute(key, value);
      }
      nodeCache.push(node);
      document.head.appendChild(node);
      nextPageHeadOptions.nodeCache.set("meta", nodeCache);
    }
  }

  if (nextPageHeadOptions.nodeCache.has("link")) {
    for (const node of nextPageHeadOptions.nodeCache.get("link") as HTMLElement[]) {
      document.head.appendChild(node);
    }
  } else if (nextPageHeadOptions.link) {
    let nodeCache: HTMLElement[] = [];
    for (const link of nextPageHeadOptions.link) {
      const node = document.createElement("link");
      for (const [key, value] of Object.entries(link)) {
        node.setAttribute(key, value);
      }
      nodeCache.push(node);
      document.head.appendChild(node);
      nextPageHeadOptions.nodeCache.set("link", nodeCache);
    }
  }

  if (nextPageHeadOptions.nodeCache.has("link")) {
    for (const node of nextPageHeadOptions.nodeCache.get("link") as HTMLElement[]) {
      document.head.appendChild(node);
    }
  } else if (nextPageHeadOptions.script) {
    let nodeCache: HTMLElement[] = [];
    for (const script of nextPageHeadOptions.script) {
      const node = document.createElement("script");
      for (const [key, value] of Object.entries(script)) {
        node.setAttribute(key, String(value));
      }
      nodeCache.push(node);
      document.head.appendChild(node);
      nextPageHeadOptions.nodeCache.set("script", nodeCache);
    }
  }
}

/**
 * After a page is exiting we want to reset the DOM head to its default state
 * @param previousHeadOptions - The exiting pages head options and nodeCache
 * TODO: In the future maybe instead of replacing DOM nodes we can do a more nuanced DIFF and update attrs
 */
function resetDOMHeadToDefaults(previousHeadOptions: HeadOptionsWithCache): void {
  function traverse(values: (HTMLElement | HTMLElement[])[]) {
    for (const layer of values) {
      if (layer instanceof HTMLElement) {
        document.head.removeChild(layer);
      } else if (Array.isArray(layer)) {
        traverse(layer);
      }
    }
  }

  traverse(Array.from(previousHeadOptions.nodeCache.values()));
}

/**
 * Called whenever a new page is routed to.
 * This function will refresh the DOM head with the new page's head options.
 * It should always be able to maintain the baseline head options unless they are overwritten by page specific options.
 * @param nextClassName - The class name of the page component
 * @param prevClassName - The class name of the previous page component
 */
export function refreshDOMHead(nextClassName: string, prevClassName?: string) {
  const nextPageHeadOptions = pageHeadOptionsMap.get(nextClassName);
  const prevPageHeadOptions = prevClassName ? pageHeadOptionsMap.get(prevClassName) : undefined;

  if (prevPageHeadOptions) {
    resetDOMHeadToDefaults(prevPageHeadOptions);
  }

  // TODO: Should use a page hierarchy tree to determine an order of fallbacks
  applyDOMHead(nextPageHeadOptions ?? defaultHeadOptions);
}

/**
 * Seed the default head options for the application.
 * Should run at the initialization of the application.
 */
export function seedDefaultHeadOptions(): void {
  let title!: HTMLElement;
  const metas: HTMLElement[] = [];
  const links: HTMLElement[] = [];
  const scripts: HTMLElement[] = [];
  const others: HTMLElement[] = [];

  for (const node of document.head.childNodes) {
    if (node instanceof HTMLElement) {
      switch (node.tagName) {
        case "title":
          title = node;
          break;
        case "link":
          links.push(node);
          break;
        case "meta":
          metas.push(node);
          break;
        case "script":
          scripts.push(node);
          break;
        default:
          others.push(node);
          break;
      }
    }
  }

  defaultHeadOptions.nodeCache.set("title", title);
  defaultHeadOptions.nodeCache.set("meta", metas);
  defaultHeadOptions.nodeCache.set("link", links);
  defaultHeadOptions.nodeCache.set("script", scripts);
  defaultHeadOptions.nodeCache.set("others", others);
}
