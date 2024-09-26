import { ConcertLog } from "@concertjs/core";

export class CountDisplay {
  @ConcertLog
  static render(props) {
    return (
      <div>
        Count: {props.count}, Double: {props.double}
      </div>
    );
  }
}
