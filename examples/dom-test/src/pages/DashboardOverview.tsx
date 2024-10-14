import { Head } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "DashboardOverview Page",
  meta: [{ name: "description", content: "DashboardOverview" }]
})
export class DashboardOverview {
  static render(props: Props) {
    return (
      <div>
        <h1>DashboardOverview</h1>
        <p>{JSON.stringify(props)}</p>
      </div>
    );
  }
}
