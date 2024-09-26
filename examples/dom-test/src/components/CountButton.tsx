import { ConcertLog } from "@concertjs/core";

export class CountButton {
  @ConcertLog
  static render(props) {
    return <button onClick={props.onIncrement}>Increment</button>;
  }
}
