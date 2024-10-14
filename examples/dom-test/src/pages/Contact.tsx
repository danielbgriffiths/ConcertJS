import { Head } from "@concertjs/core";

export type Props = {
  pageName: string;
};

@Head({
  title: "Contact Page",
  meta: [{ name: "description", content: "Contact us for more information" }]
})
export class Contact {
  static render(props: Props) {
    return (
      <div>
        <h1>Contact</h1>
        <p>Send us an email at {JSON.stringify(props)}</p>
      </div>
    );
  }
}
