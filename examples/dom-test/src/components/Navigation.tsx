import { ConcertLog } from "@concertjs/core";

export class Navigation {
  @ConcertLog
  static render(props) {
    return (
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
        </ul>
      </nav>
    );
  }
}
