import { Head, Route } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "DashboardDetails Page",
  meta: [{ name: "description", content: "DashboardDetails" }]
})
@Route<Props>({
  path: "/dashboard/details",
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
