const { createFilter } = require("@rollup/pluginutils");
const babel = require("@babel/core");

const concertjsBabelPreset = require("@concertjs/babel-preset-concertjs");

function concertjsPlugin(options = {}) {
  const filter = createFilter(
    options.include || ["**/*.{js,jsx,ts,tsx}"],
    options.exclude || "node_modules/**"
  );

  return {
    name: "vite-plugin-concertjs",
    enforce: "pre",

    async transform(code, id) {
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

module.exports = concertjsPlugin;
