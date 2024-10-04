export function App() {
  const isAThing = true;

  return (
    <>
      <div if={isAThing}>Inline If</div>
      <div else>Not</div>
    </>
  );
}
