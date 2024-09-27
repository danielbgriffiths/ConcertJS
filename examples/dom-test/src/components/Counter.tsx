import { ConcertLog, effect, memo, onCleanup, onMount, signal } from "@concertjs/core";

import { CountDisplay } from "./CountDisplay";
import { CountButton } from "./CountButton";

export class Counter {
  @ConcertLog
  static render() {
    const [count, setCount] = signal(0);
    const double = memo(() => count() * 2);

    onMount(() => {
      console.log("Mounted Counter");
    });

    onCleanup(() => {
      console.log("Cleaned up Counter");
    });

    effect((): void => {
      console.log("count/double: ", count(), double());
    });

    setTimeout((): void => {
      setCount(count() + 1);
    }, 1000);

    return (
      <div class="counter-wrapper">
        <CountDisplay count={count()} double={double()} />
        <CountButton
          onIncrement={() => {
            setCount(count() + 1);
          }}
        />
        {count() === 1 ? <p>Count is 1</p> : <p>Count is not 1</p>}
        <div switch={count()} class="switch-element">
          <p case={0} class="case-two">
            Count Is Initial
          </p>
          <p case={10} class="case-three">
            Count Made it to 10
          </p>
          <p case={20} class="case-four">
            Count Made it to 20
          </p>
          <p case class="default-case">
            Count is Not At a landmark value
          </p>
        </div>
      </div>
    );
  }
}
