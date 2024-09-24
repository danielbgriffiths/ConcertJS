export class Batcher {
  private static queue = new Set<() => void>();
  private static isFlushing = false;

  static schedule(task: () => void) {
    this.queue.add(task);
    if (!this.isFlushing) {
      this.isFlushing = true;
      Promise.resolve().then(() => this.flush());
    }
  }

  private static flush() {
    for (const task of this.queue) {
      task();
    }
    this.queue.clear();
    this.isFlushing = false;
  }
}
