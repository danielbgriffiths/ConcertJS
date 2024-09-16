const presetEnv = require('@babel/preset-env');
const presetTypescript = require('@babel/preset-typescript');
const syntaxJSX = require('@babel/plugin-syntax-jsx');
const transformConcertJSX = require('./plugins/transform-concert-jsx');

module.exports = function BabelPresetConcertJS(api, options = {}) {
  api.assertVersion(7);

  return {
    presets: [
      [
        presetEnv,
        { targets: options.targets || '> 0.25%, not dead' },
      ],
      presetTypescript,
    ],
    plugins: [
      syntaxJSX,
      transformConcertJSX,
    ],
  };
};
