import { ConcertLog, effect, onCleanup, onMount } from "@concertjs/core";

@ConcertLog
export class CountDisplay {
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
