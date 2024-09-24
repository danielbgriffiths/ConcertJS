import { DependencyTracker, DependencyNode, Subscriber } from "./dependency-tracker";
import { Batcher } from "./batcher";

export class Signal<T> implements DependencyNode {
  private _value: T;
  private subscribers = new Set<Subscriber>();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    DependencyTracker.track(this);
    return this._value;
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return;
    this._value = newValue;
    Batcher.schedule(() => this.notify());
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
}
