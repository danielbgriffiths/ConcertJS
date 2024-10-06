import { signal } from "@concertjs/core";

function Item(props: { item: string }) {
  return <li>{props.item}</li>;
}

export function App() {
  const [items] = signal(["1", "2", "3"]);

  return (
    <ul>
      {items().map((item, idx) => (
        <Item key={idx} item={item} />
      ))}
    </ul>
  );
}
