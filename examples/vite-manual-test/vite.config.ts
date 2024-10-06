import { defineConfig } from "vite";

import concertjsPlugin from "@concertjs/vite-plugin-concertjs";

export default defineConfig({
  plugins: [concertjsPlugin()],
  resolve: {
    extensions: [".ts", ".tsx"]
  }
});
