import { ConcertLog, MeasurePerformance, onCleanup, onMount } from "@concertjs/core";

@ConcertLog
export class CountButton {
  @MeasurePerformance({ name: "CountButton" })
  static render(props) {
    onMount(() => {
      console.log("Mounted CountButton");
    });

    onCleanup(() => {
      console.log("Cleaned up CountButton");
    });

    return (
      <button onClick={props.onIncrement} class="count-button" type="button">
        Increment
      </button>
    );
  }
}
