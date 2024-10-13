import { Head, Route, UseRouter } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "User Page",
  meta: [{ name: "description", content: "User" }]
})
@Route<Props>({
  path: "/users/:id",
  props: { isRouted: true },
  exact: true
})
export class User {
  @UseRouter
  static render(props: Props, context) {
    return (
      <div>
        <h1>User {context.router?.params()?.id}</h1>
        <p>{JSON.stringify(props)}</p>
      </div>
    );
  }
}
