const presetEnv = require("@babel/preset-env");
const presetTypescript = require("@babel/preset-typescript");
const syntaxJSX = require("@babel/plugin-syntax-jsx");
const decorators = require("@babel/plugin-proposal-decorators");
const transformClassProperties = require("@babel/plugin-transform-class-properties");
const transformRuntime = require("@babel/plugin-transform-runtime");
const transformConcertJSX = require("@concertjs/babel-plugin-transform-concertjs-jsx");

const collectConcertRoutes = require("./plugins/collect-concertjs-routes");
const importConcertPragma = require("./plugins/import-concertjs-pragma");
const registerConcertDirectives = require("./plugins/register-concertjs-directives");

module.exports = function BabelPresetConcertJS(api, options = {}) {
  api.assertVersion(7);

  return {
    presets: [
      [presetEnv, { targets: { browsers: ["last 2 versions"] }, modules: false }],
      presetTypescript
    ],
    plugins: [
      collectConcertRoutes,
      registerConcertDirectives,
      [decorators, { decoratorsBeforeExport: true }],
      [transformClassProperties, { loose: false }],
      transformRuntime,
      importConcertPragma,
      syntaxJSX,
      transformConcertJSX
    ]
  };
};
