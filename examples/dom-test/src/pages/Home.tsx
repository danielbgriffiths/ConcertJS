import {
  ConcertLog,
  onCleanup,
  onMount,
  Route,
  Directive,
  MeasurePerformance,
  Head
} from "@concertjs/core";

import { Counter } from "../components/Counter";
import { ToDoList } from "../components/ToDoList";
import { useClock } from "../hooks/clock";
import { TooltipDirective } from "../directives/tooltip";

interface Props {
  isRouted: boolean;
}

@Head({ title: "Home Page" })
@Route<Props>({
  path: "/",
  name: "home-page",
  props: { isRouted: true },
  exact: true,
  beforeEntry: () => {
    console.log("beforeEntry");
  },
  afterEntry: () => {
    console.log("afterEntry");
  }
})
@Directive([["tooltip", TooltipDirective]])
@ConcertLog
export class Home {
  @MeasurePerformance({ name: "Home" })
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
          <h1 use-tooltip={{ content: "Some Tooltip Text" }}>Home Page</h1>
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
