const fs = require("fs");
const path = require("path");

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

module.exports = {
  meta: {
    name: pkg.name,
    version: pkg.version
  },
  rules: {
    "jsx-attrs": {
      create(context) {
        return {
          JSXAttribute(node) {
            const validAttributes = [
              "if",
              "else-if",
              "else",
              "map",
              "pending",
              "fallback",
              "switch",
              "case"
            ];

            if (!validAttributes.includes(node.name.name)) {
              return;
            }

            context.report({
              node,
              message: `Custom JSX attribute '${node.name.name}' found.`
            });
          }
        };
      }
    }
  }
};
