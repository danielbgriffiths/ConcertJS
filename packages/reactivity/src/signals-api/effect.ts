import { DependencyTracker, DependencyNode } from "./dependency-tracker";
import { Batcher } from "./batcher";

export class Effect {
  private effectFn: () => void | (() => void);
  private dependencies = new Set<DependencyNode>();
  private dependencyUnsubscribes: (() => void)[] = [];
  private cleanupFn?: () => void;
  private isDisposed = false;

  constructor(effectFn: () => void | (() => void)) {
    this.effectFn = effectFn;
    this.run();
  }

  private run() {
    this.cleanup();
    this.cleanupDependencies();
    DependencyTracker.begin(this);
    const cleanupFn = this.effectFn();
    DependencyTracker.end();
    if (typeof cleanupFn === "function") {
      this.cleanupFn = cleanupFn;
    }
  }

  private cleanup() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = undefined;
    }
  }

  addDependency(dep: DependencyNode) {
    if (this.dependencies.has(dep)) return;
    this.dependencies.add(dep);
    const subscriber = () => Batcher.schedule(() => this.run());
    dep.addSubscriber(subscriber);
    this.dependencyUnsubscribes.push(() => dep.removeSubscriber(subscriber));
  }

  private cleanupDependencies() {
    for (const unsubscribe of this.dependencyUnsubscribes) {
      unsubscribe();
    }
    this.dependencyUnsubscribes = [];
    this.dependencies.clear();
  }

  dispose() {
    if (this.isDisposed) return;
    this.cleanup();
    this.cleanupDependencies();
    this.isDisposed = true;
  }
}
