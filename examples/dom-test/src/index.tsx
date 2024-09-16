import { effect, memo, render, signal } from "@concertjs/core";

function CountButton(props) {
  function onClickIncrement() {
    props.onIncrement();
  }

  return <button onClick={onClickIncrement}>Increment</button>;
}

function CountDisplay(props) {
  return (
    <div>
      Count: {props.count}, Double: {props.double}
    </div>
  );
}

function App() {
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
      <CountDisplay count={count()} double={double()} />
      <CountButton onIncrement={() => setCount(count() + 1)} />
    </div>
  );
}

const root = document.getElementById("app")!;
render(root, App);
