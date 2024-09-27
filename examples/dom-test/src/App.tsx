import { ConcertLog, onMount, onCleanup } from "@concertjs/core";

import { Counter } from "./components/Counter";

export class App {
  @ConcertLog
  static render() {
    onMount(() => {
      console.log("Mounted App");
    });

    onCleanup(() => {
      console.log("Cleaned up App");
    });

    return (
      <div autofocus class="app-wrapper">
        <Counter />
      </div>
    );
  }
}
