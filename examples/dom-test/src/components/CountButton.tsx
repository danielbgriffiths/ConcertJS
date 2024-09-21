import { ConcertLog } from "@concertjs/core";
import { Button } from "./Button";

export class CountButton {
  @ConcertLog
  static render(props, instance) {
    return <Button onClick={() => props.onIncrement()} text={"Increment"} />;
  }
}
