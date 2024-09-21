import { ConcertLog, effect, memo, signal } from "@concertjs/core";

import { CountDisplay } from "./components/CountDisplay";
import { CountButton } from "./components/CountButton";
import { Navigation } from "./components/Navigation";

export class App {
  @ConcertLog
  static render() {
    const [count, setCount] = signal(0);
    const double = memo(() => count() * 2);

    setTimeout(() => {
      setCount(count() + 1);
    }, 1000);

    effect(() => {
      console.log("count: ", count());
    });

    return (
      <div>
        <h1>Home Page</h1>
        <Navigation />
        <CountDisplay count={count()} double={double()} />
        <CountButton onIncrement={() => setCount(count() + 1)} />
        {count() === 1 && <p>Count is 1</p>}
        <div switch={count()}>
          <p case={0}>Count Is Initial</p>
          <p case={10}>Count Made it to 10</p>
          <p case={20}>Count Made it to 20</p>
          <p case>Count is Not At a landmark value</p>
        </div>
      </div>
    );
  }
}
