import { ConcertLog, Route } from "@concertjs/core";

@Route("/donate")
export class Donate {
  @ConcertLog
  static render() {
    return (
      <div>
        <h1>Donate Page</h1>
      </div>
    );
  }
}
