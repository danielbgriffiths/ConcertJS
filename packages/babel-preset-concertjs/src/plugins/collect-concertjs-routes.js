const fs = require("fs");
const path = require("path");
const t = require("@babel/types");
const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);

  const routes = [];

  return {
    name: "collect-concert-routes",
    visitor: {
      ClassDeclaration(path, state) {
        if (!path.node.decorators) return;

        path.node.decorators.forEach(decorator => {
          if (
            !t.isCallExpression(decorator.expression) ||
            !t.isIdentifier(decorator.expression.callee, { name: "Route" })
          )
            return;

          if (!decorator.expression.arguments.length || !t.isStringLiteral(args[0])) return;

          const routePath = decorator.expression.arguments[0].value;
          const className = path.node.id.name;

          routes.push({
            path: routePath,
            className,
            filePath: state.file.opts.filename
          });
        });
      }
    },
    post() {
      if (!routes.length) return;

      const registryPath = path.resolve(process.cwd(), "src", "routeRegistry.generated.js");

      const importStatements = routes
        .map(
          route =>
            `import { ${route.className} } from '${path
              .relative(path.dirname(registryPath), route.filePath)
              .replace(/\\/g, "/")
              .replace(/\.tsx?$/, "")}';`
        )
        .join("\n");

      const routeMappings = routes
        .map(route => `  { path: '${route.path}', component: ${route.className} },`)
        .join("\n");

      const registryContent = `${importStatements}\n\nexport const routes = [\n${routeMappings}\n];\n`;

      fs.writeFileSync(registryPath, registryContent); // , "utf8");
      console.log(`Route registry generated at ${registryPath}`);
    }
  };
});
