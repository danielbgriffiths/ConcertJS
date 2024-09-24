import { DependencyTracker, DependencyNode, Subscriber } from "./dependency-tracker";
import { Batcher } from "./batcher";

export class ComputedSignal<T> implements DependencyNode {
  private computeFn!: () => T;
  private _value!: T;
  private dependencies = new Set<DependencyNode>();
  private dependencyUnsubscribes: (() => void)[] = [];
  private subscribers = new Set<Subscriber>();

  constructor(computeFn: () => T) {
    this.computeFn = computeFn;
    this.evaluate();
  }

  get value(): T {
    DependencyTracker.track(this);
    return this._value;
  }

  private evaluate() {
    this.cleanupDependencies();
    DependencyTracker.begin(this);
    const newValue = this.computeFn();
    DependencyTracker.end();
    const changed = !Object.is(this._value, newValue);
    this._value = newValue;
    if (changed) {
      Batcher.schedule(() => this.notify());
    }
  }

  private notify() {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }

  addSubscriber(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
  }

  removeSubscriber(subscriber: Subscriber) {
    this.subscribers.delete(subscriber);
  }

  addDependency(dep: DependencyNode) {
    if (this.dependencies.has(dep)) return;
    this.dependencies.add(dep);
    const subscriber = () => this.evaluate();
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
}
