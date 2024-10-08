import { Head, Route } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "Contact Page"
})
@Route<Props>({
  path: "/contact",
  name: "contact-page",
  props: async (): Promise<Props> => {
    return new Promise<Props>(resolve => {
      setTimeout(() => {
        resolve({ isRouted: true });
      }, 1000);
    });
  },
  exact: true,
  beforeEntry: () => {
    console.log("beforeEntry");
  },
  afterEntry: () => {
    console.log("afterEntry");
  }
})
export class Contact {
  static render(props: Props) {
    return (
      <div>
        <h1>Contact</h1>
        <p>Send us an email at</p>
      </div>
    );
  }
}
