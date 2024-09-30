export function App() {
  function is() {
    return false;
  }

  return (
    <div>
      <div>{is() ? <span>Is</span> : <span>Not</span>}</div>
      <div>
        {["item", "test"].map(el => (
          <span>{el}</span>
        ))}
      </div>
    </div>
  );
}
