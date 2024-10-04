import { ConcertLog, effect, onCleanup, onMount, Route } from "@concertjs/core";

import { Counter } from "../components/Counter";
import { ToDoList } from "../components/ToDoList";
import { useClock } from "../hooks/clock";

@Route("/")
@ConcertLog
export class Home {
  static render() {
    const clock = useClock();

    onMount(() => {
      console.log("Mounted Home");
    });

    onCleanup(() => {
      console.log("Cleaned up Home");
    });

    return (
      <div class="home-wrapper">
        <div>
          <h1>Home Page</h1>
          <div>
            <p>{clock.time()}</p>
          </div>
        </div>
        <Counter />
        <ToDoList />
      </div>
    );
  }
}
