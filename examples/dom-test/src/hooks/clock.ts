import { signal } from "@concertjs/core";

export function useClock() {
  const [time, setTime] = signal(new Date().toISOString());

  setInterval(() => {
    setTime(new Date().toISOString());
  }, 1000);

  return {
    time
  };
}
