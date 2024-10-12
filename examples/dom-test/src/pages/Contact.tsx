import { Head, onMount, Route, UseRouter } from "@concertjs/core";

interface Props {
  ContactRouteHit: boolean;
}

@Head({
  title: "Contact Page",
  meta: [{ name: "description", content: "Contact us for more information" }]
})
@Route<Props>({
  path: "/contact",
  props: async (): Promise<Props> => {
    return new Promise<Props>(resolve => {
      setTimeout(() => {
        console.log("Contact props resolved");
        resolve({ ContactRouteHit: "Hit!" });
      }, 5000);
    });
  },
  exact: true
})
export class Contact {
  @UseRouter
  static render(props: Props, context) {
    onMount(() => {
      console.log("Contact: ", props, context);
    });

    return (
      <div>
        <h1>Contact</h1>
        <p>Send us an email at {JSON.stringify(props)}</p>
      </div>
    );
  }
}
