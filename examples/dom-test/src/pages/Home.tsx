import { Route, Head } from "@concertjs/core";

interface Props {
  homeRouteHit: boolean;
}

@Head({
  title: "Home Page",
  meta: [{ name: "description", content: "This is the home page" }]
})
@Route<Props>({
  path: "/",
  props: () => ({
    homeRouteHit: true
  }),
  exact: true
})
export class Home {
  static render(props: Props) {
    return (
      <div class="home-wrapper">
        <h1>Home Page</h1>
        <div>This is the home page {JSON.stringify(props)}</div>
      </div>
    );
  }
}
