import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/bundle.js",
      format: "cjs",
      name: "@concertjs/core",
      sourcemap: true
    },
    {
      file: "dist/bundle.esm.js",
      format: "esm",
      sourcemap: true
    }
  ],
  plugins: [resolve(), typescript()]
};
