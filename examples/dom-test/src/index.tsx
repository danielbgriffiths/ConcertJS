import { mount } from "@concertjs/core";

import { App } from "./App";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";

mount("#app", () => <App />, {
  modules: [Contact, Home],
  directives: [],
  stores: [],
  services: []
});
