import { ConcertLog, onCleanup, onMount } from "@concertjs/core";

export class CountButton {
  @ConcertLog
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
