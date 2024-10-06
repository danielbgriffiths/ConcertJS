import { ConcertLog, effect, MeasurePerformance, onCleanup, onMount } from "@concertjs/core";

@ConcertLog
export class CountDisplay {
  @MeasurePerformance({ name: "CountDisplay" })
  static render(props) {
    onMount(() => {
      console.log("Mounted CountDisplay");
    });

    onCleanup(() => {
      console.log("Cleaned up CountDisplay");
    });

    effect(() => {
      console.log("CountDisplay: (count/double): ", props.count(), props.double());
    });

    return (
      <div class="count-display-wrapper">
        Count: {props.count()}, Double: {props.double()}
      </div>
    );
  }
}
