import { mount } from "@concertjs/core";

import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { User } from "./pages/User";
import { Users } from "./pages/Users";
import { DashboardOverview } from "./pages/DashboardOverview";
import { DashboardDetails } from "./pages/DashboardDetails";
import { NotFound } from "./pages/NotFound";

import { App } from "./App";

mount("#app", App, {
  modules: [Contact, Home, Dashboard, User, Users, DashboardOverview, DashboardDetails, NotFound],
  directives: [],
  stores: [],
  services: []
});
