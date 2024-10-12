import { RouteOutlet, WithRouter, UseRouter, effect, Link } from "@concertjs/core";

@WithRouter({ type: "memory" })
export class App {
  @UseRouter
  static render(props, context) {
    effect(() => {
      console.log("route: ", props, context, context?.router?.activeRoute?.());
    });

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
        <RouteOutlet />
      </div>
    );
  }
}
