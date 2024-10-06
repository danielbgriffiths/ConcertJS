import { ConcertLog, onMount, onCleanup } from "@concertjs/core";

import { Home } from "./pages/Home";

@ConcertLog
export class App {
  static render() {
    onMount(() => {
      console.log("Mounted App");
    });

    onCleanup(() => {
      console.log("Cleaned up App");
    });

    return (
      <div class="app-wrapper">
        <Home />
      </div>
    );
  }
}
