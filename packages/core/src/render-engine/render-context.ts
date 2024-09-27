let activeRenderContext!: RenderContext | undefined;

export function getActiveRenderContext(): RenderContext | undefined {
  return activeRenderContext;
}

export function setActiveRenderContext(nextRenderContext?: RenderContext): void {
  activeRenderContext = nextRenderContext;
}

export class RenderContext {
  private mountFns: Set<() => void> = new Set();
  private cleanupFns: Set<() => void> = new Set();

  public addMount(fn: () => void): void {
    this.mountFns.add(fn);
  }

  public addCleanup(fn: () => void): void {
    this.cleanupFns.add(fn);
  }

  public removeMount(fn: () => void): void {
    this.mountFns.delete(fn);
  }

  public removeCleanup(fn: () => void): void {
    this.cleanupFns.delete(fn);
  }

  public runMounts(): void {
    this.mountFns.forEach(fn => fn());
  }

  public runCleanups(): void {
    this.cleanupFns.forEach(fn => fn());
  }
}
