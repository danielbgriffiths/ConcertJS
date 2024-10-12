import { Head, Route } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "Users Page",
  meta: [{ name: "description", content: "Users" }]
})
@Route<Props>({
  path: "/users",
  props: { isRouted: true },
  exact: true
})
export class Users {
  static render(props: Props) {
    return (
      <div>
        <h1>Users</h1>
        <p>{JSON.stringify(props)}</p>
      </div>
    );
  }
}
