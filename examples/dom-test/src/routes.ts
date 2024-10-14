import { lazyImport, RouteOptions } from "@concertjs/router";

import type { Props as ContactProps } from "./pages/Contact";
import type { Props as UsersProps } from "./pages/Users";
import type { Props as UserProps } from "./pages/User";
import type { Props as DashboardDetailsProps } from "./pages/DashboardDetails";

const contactRoute: RouteOptions<ContactProps> = {
  path: "contact",
  element: lazyImport("./pages/Contact"),
  props: { pageName: "Contact" }
};

const usersRoute: RouteOptions<UsersProps> = {
  path: "users",
  element: lazyImport("./pages/Users"),
  props: { pageName: "Users" }
};

const userRoute: RouteOptions<UserProps> = {
  path: "users/:id",
  element: lazyImport("./pages/User"),
  props: context => ({ userId: context.router.params.id })
};

const dashboardDetailsRoute: RouteOptions<DashboardDetailsProps> = {
  path: "details",
  element: lazyImport("./pages/DashboardDetails"),
  props: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ pageName: "Dashboard Details" });
      }, 3000);
    });
  }
};

export const routes: RouteOptions[] = [
  {
    path: "",
    element: lazyImport("./pages/Home")
  },
  contactRoute,
  usersRoute,
  userRoute,
  {
    path: "dashboard",
    element: lazyImport("./pages/Dashboard"),
    children: [
      {
        path: "overview",
        element: lazyImport("./pages/DashboardOverview")
      },
      dashboardDetailsRoute
    ]
  },
  {
    path: "*",
    element: lazyImport("./pages/NotFound")
  }
];
