import { effect, signal, ConcertLog, memo } from "@concertjs/core";

import { CountDisplay } from "./CountDisplay";
import { CountButton } from "./CountButton";

export class Counter {
  @ConcertLog
  static render() {
    return (
      <div>
        <CountDisplay count={1} double={2} />
        <CountButton onIncrement={() => {}} />
        {1 === 1 && <p>Count is 1</p>}
        <div switch={1}>
          <p case={0}>Count Is Initial</p>
          <p case={10}>Count Made it to 10</p>
          <p case={20}>Count Made it to 20</p>
          <p case>Count is Not At a landmark value</p>
        </div>
      </div>
    );
  }
}
