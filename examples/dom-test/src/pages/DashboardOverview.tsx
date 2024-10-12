import { Head, Route } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "DashboardOverview Page",
  meta: [{ name: "description", content: "DashboardOverview" }]
})
@Route<Props>({
  path: "/dashboard/overview",
  props: async (): Promise<Props> => {
    return new Promise<Props>(resolve => {
      setTimeout(() => {
        console.log("props resolved");
        resolve({ isRouted: false });
      }, 5000);
    });
  },
  exact: true
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
