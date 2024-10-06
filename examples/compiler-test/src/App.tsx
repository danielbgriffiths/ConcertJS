import { Directive } from "@concertjs/core";

function LogDirective(element, props) {
  console.log("element, props: ", element, props);
}

@Directive([["log", LogDirective]])
export class App {
  static render() {
    return <div use-log={{ content: "test" }}>Test</div>;
  }
}
