import { Head, Route, RouteOutlet } from "@concertjs/core";

interface Props {
  isRouted: boolean;
}

@Head({
  title: "Dashboard Page",
  meta: [{ name: "description", content: "Dashboard" }]
})
@Route<Props>({
  path: "/dashboard",
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
export class Dashboard {
  static render(props: Props) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>{JSON.stringify(props)}</p>
        <RouteOutlet />
      </div>
    );
  }
}
