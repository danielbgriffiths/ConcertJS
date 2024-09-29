import { getActiveRenderContext } from "./render-context";

export function onMount(mountFnCallback: () => void): () => void {
  const activeRenderContext = getActiveRenderContext();

  if (!activeRenderContext) {
    throw new Error("Cannot call onMount outside of render context");
  }

  activeRenderContext.addMount(mountFnCallback);

  return activeRenderContext.removeMount.bind(activeRenderContext, mountFnCallback);
}

export function onCleanup(cleanupFnCallback: () => void): () => void {
  const activeRenderContext = getActiveRenderContext();

  if (!activeRenderContext) {
    throw new Error("Cannot call onCleanup outside of render context");
  }

  activeRenderContext.addCleanup(cleanupFnCallback);

  return activeRenderContext.removeCleanup.bind(activeRenderContext, cleanupFnCallback);
}

export function replaceChild(parent: Node, newChild: Node, oldChild?: Node): void {
  if (oldChild) {
    runCleanupFns(oldChild);
    parent.replaceChild(newChild, oldChild);
  } else {
    parent.appendChild(newChild);
  }
}

export function removeChild(parent: Node, child: Node): void {
  if (!child) return;
  runCleanupFns(child);
  parent.removeChild(child);
}

export function observeCleanupLifecycle(): void {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const removedNode of mutation.removedNodes) {
        runCleanupFns(removedNode);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function runCleanupFns(node: Node): void {
  if (!(node as any).__cleanupFns) return;
  (node as any).__cleanupFns.forEach((fn: () => void) => fn());
  delete (node as any).__cleanupFns;
}
