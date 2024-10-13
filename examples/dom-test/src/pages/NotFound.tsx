import { Route } from "@concertjs/core";

@Route({
  path: "*"
})
export class NotFound {
  static render() {
    return (
      <div>
        <h1>404 - Not Found</h1>
      </div>
    );
  }
}
