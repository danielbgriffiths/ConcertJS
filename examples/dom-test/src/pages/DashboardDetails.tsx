import { Head } from "@concertjs/core";

export type Props = {
  pageName: string;
};

@Head({
  title: "DashboardDetails Page",
  meta: [{ name: "description", content: "DashboardDetails" }]
})
export class DashboardDetails {
  static render(props: Props) {
    return (
      <div>
        <h1>DashboardDetails</h1>
        <p>{JSON.stringify(props)}</p>
      </div>
    );
  }
}
