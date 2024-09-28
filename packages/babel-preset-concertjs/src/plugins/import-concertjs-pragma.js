const t = require("@babel/types");
const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "import-concert-pragma",
    visitor: {
      Program(path) {
        let hasJSX = false;
        let hasHImport = false;

        path.traverse({
          JSXElement() {
            hasJSX = true;
          },
          ImportDeclaration(path) {
            if (path.node.source.value !== "@concertjs/core") return;

            path.node.specifiers.forEach(specifier => {
              if (specifier.imported && specifier.imported.name === "h") {
                hasHImport = true;
              }
            });
          }
        });

        if (hasJSX && !hasHImport) {
          const importDeclaration = t.importDeclaration(
            [t.importSpecifier(t.identifier("h"), t.identifier("h"))],
            t.stringLiteral("@concertjs/core")
          );

          path.node.body.unshift(importDeclaration);
        }
      }
    }
  };
});
