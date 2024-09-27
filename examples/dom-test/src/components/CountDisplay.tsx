import { ConcertLog, effect, onCleanup, onMount } from "@concertjs/core";

export class CountDisplay {
  @ConcertLog
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
