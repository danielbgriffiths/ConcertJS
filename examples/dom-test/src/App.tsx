import { Link, WithRouter } from "@concertjs/router";
import type { PropsWithChildren } from "@concertjs/core";
import { routes } from "./routes";

type Props = PropsWithChildren;

@WithRouter(routes)
export class App {
  static render(props: Props) {
    return (
      <div class="app-wrapper">
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/users">Users</Link>
            </li>
            <li>
              <Link href="/users/1">User</Link>
            </li>
            <li>
              <Link href="/dashboard/details">Dashboard Details</Link>
            </li>
            <li>
              <Link href="/dashboard/overview">Dashboard Overview</Link>
            </li>
          </ul>
        </nav>
        <div>{props.children}</div>
      </div>
    );
  }
}
