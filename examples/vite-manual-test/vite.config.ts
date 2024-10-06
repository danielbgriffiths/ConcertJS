import { defineConfig } from "vite";
import concertjsPlugin from "@concertjs/vite-plugin-concertjs";

export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx"]
  },
  plugins: [concertjsPlugin()]
});
