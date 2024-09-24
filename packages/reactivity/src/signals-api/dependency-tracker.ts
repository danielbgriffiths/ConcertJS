export type Subscriber = () => void;

export interface DependencyNode {
  addSubscriber(subscriber: Subscriber): void;
  removeSubscriber(subscriber: Subscriber): void;
}

export class DependencyTracker {
  private static stack: any[] = [];

  static begin(context: any) {
    this.stack.push(context);
  }

  static end() {
    this.stack.pop();
  }

  static track(dep: DependencyNode) {
    const context = this.currentContext();
    if (context && typeof context.addDependency === "function") {
      context.addDependency(dep);
    }
  }

  private static currentContext() {
    return this.stack[this.stack.length - 1];
  }
}
