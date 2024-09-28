import { ConcertLog, onCleanup, onMount, Route } from "@concertjs/core";

import { Counter } from "../components/Counter";

@Route("/")
@ConcertLog
export class Home {
  static render() {
    onMount(() => {
      console.log("Mounted Home");
    });

    onCleanup(() => {
      console.log("Cleaned up Home");
    });

    return (
      <div class="home-wrapper">
        <Counter />
      </div>
    );
  }
}
