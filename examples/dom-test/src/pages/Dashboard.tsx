import { Head, PropsWithChildren } from "@concertjs/core";

type Props = PropsWithChildren<{
  isRouted: boolean;
}>;

@Head({
  title: "Dashboard Page",
  meta: [{ name: "description", content: "Dashboard" }]
})
export class Dashboard {
  static render(props: Props) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>{JSON.stringify(props)}</p>
        {props.children}
      </div>
    );
  }
}
