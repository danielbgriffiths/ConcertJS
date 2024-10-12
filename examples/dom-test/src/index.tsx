import { mount } from "@concertjs/core";

import { App } from "./App";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { User } from "./pages/User";
import { Users } from "./pages/Users";
import { DashboardOverview } from "./pages/DashboardOverview";
import { DashboardDetails } from "./pages/DashboardDetails";

mount("#app", App, {
  modules: [Contact, Home, Dashboard, User, Users, DashboardOverview, DashboardDetails],
  directives: [],
  stores: [],
  services: []
});
