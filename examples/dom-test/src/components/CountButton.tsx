export function CountButton(props) {
  function onClickIncrement() {
    props.onIncrement();
  }

  return <button onClick={onClickIncrement}>Increment</button>;
}
