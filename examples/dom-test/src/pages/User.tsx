import { Head } from "@concertjs/core";
import { UseRouter } from "@concertjs/router";

export interface Props {
  userId: string;
}

@Head({
  title: "User Page",
  meta: [{ name: "description", content: "User" }]
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
