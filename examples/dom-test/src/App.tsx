import { ConcertLog } from "@concertjs/core";

import { Counter } from "./components/Counter";

export class App {
  @ConcertLog
  static render() {
    return (
      <div data-test-id={1} autofocus>
        <Counter />
      </div>
    );
  }
}
