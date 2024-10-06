import { createFilter } from "@rollup/pluginutils";
import * as babel from "@babel/core";

import concertjsBabelPreset from "@concertjs/babel-preset-concertjs";

export type ConcertVitePluginOptions = {
  exclude?: string | string[];
  include?: string | string[];
  babelPresets?: Function[];
  babelPlugins?: Function[];
};

export default function concertjsPlugin(options: ConcertVitePluginOptions = {}) {
  const filter = createFilter(
    options.include || ["**/*.{js,jsx,ts,tsx}"],
    options.exclude || "node_modules/**"
  );

  return {
    name: "vite-plugin-concertjs",
    enforce: "pre",

    async transform(code: string, id: string): Promise<unknown> {
      if (!filter(id)) return null;

      if (id.includes("node_modules")) return null;

      const result = await babel.transformAsync(code, {
        filename: id,
        presets: [concertjsBabelPreset, ...(options.babelPresets || [])],
        plugins: [...(options.babelPlugins || [])],
        babelrc: false,
        configFile: false,
        sourceMaps: true
      });

      if (!result) return null;

      return {
        code: result.code,
        map: result.map
      };
    }
  };
}
