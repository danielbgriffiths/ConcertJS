import { ConcertLog, onMount, onCleanup, MeasurePerformance } from "@concertjs/core";

import { Home } from "./pages/Home";

@ConcertLog
export class App {
  @MeasurePerformance({ name: "App" })
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
