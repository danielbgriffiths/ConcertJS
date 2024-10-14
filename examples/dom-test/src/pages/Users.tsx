import { Head } from "@concertjs/core";

export interface Props {
  pageName: string;
}

@Head({
  title: "Users Page",
  meta: [{ name: "description", content: "Users" }]
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
