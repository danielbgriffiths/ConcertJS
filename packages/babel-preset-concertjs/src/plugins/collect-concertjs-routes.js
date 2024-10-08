const fs = require("fs");
const path = require("path");
const t = require("@babel/types");
const generate = require("@babel/generator").default;
const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);

  const routes = [];

  return {
    name: "collect-concert-routes",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push(
        ["decorators", { decoratorsBeforeExport: true }],
        "typescript",
        "classProperties",
        "asyncGenerators",
        "classPrivateProperties",
        "classPrivateMethods",
        "dynamicImport",
        "numericSeparator",
        "optionalChaining",
        "objectRestSpread"
      );
    },
    visitor: {
      ClassDeclaration(path, state) {
        if (!path.node.decorators) return;

        path.node.decorators.forEach(decorator => {
          if (
            !t.isCallExpression(decorator.expression) ||
            !t.isIdentifier(decorator.expression.callee, { name: "Route" })
          ) {
            return;
          }

          if (!decorator.expression.arguments.length) return;

          const routeOptions = decorator.expression.arguments[0];

          if (!t.isObjectExpression(routeOptions)) return;

          const routePathProp = routeOptions.properties.find(
            prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "path" })
          );

          const routeNameProp = routeOptions.properties.find(
            prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "name" })
          );

          const className = path.node.id.name;

          // Gather properties from the options
          const propsProp = routeOptions.properties.find(
            prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "props" })
          );

          const exactProp = routeOptions.properties.find(
            prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "exact" })
          );

          const beforeEntryProp = routeOptions.properties.find(
            prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "beforeEntry" })
          );

          const afterEntryProp = routeOptions.properties.find(
            prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "afterEntry" })
          );

          // Extract the Props type if specified
          let propsType = null;
          if (
            decorator.expression.typeParameters &&
            decorator.expression.typeParameters.params.length
          ) {
            const typeParam = decorator.expression.typeParameters.params[0];
            if (t.isTSTypeReference(typeParam) && t.isIdentifier(typeParam.typeName)) {
              propsType = typeParam.typeName.name;
            }
          }

          routes.push({
            path: routePathProp ? routePathProp.value.value : undefined,
            name: routeNameProp ? routeNameProp.value.value : undefined,
            props: propsProp ? serializeExpression(propsProp.value) : "undefined",
            exact: exactProp ? serializeExpression(exactProp.value) : "undefined",
            beforeEntry: beforeEntryProp ? serializeExpression(beforeEntryProp.value) : "undefined",
            afterEntry: afterEntryProp ? serializeExpression(afterEntryProp.value) : "undefined",
            className,
            propsType,
            filePath: state.file.opts.filename
          });
        });
      }
    },
    post() {
      if (!routes.length) return;

      const registryPath = path.resolve(process.cwd(), "src", "routeRegistry.generated.ts");

      const importStatements = routes
        .map(route => {
          const relativePath = path
            .relative(path.dirname(registryPath), route.filePath)
            .replace(/\\/g, "/")
            .replace(/\.tsx?$/, "");

          let importLine = `import { ${route.className}`;

          if (route.propsType) {
            importLine += `, ${route.propsType}`;
          }

          importLine += ` } from '${relativePath}';`;

          return importLine;
        })
        .join("\n");

      const routeMappings = routes
        .map(route => {
          let propsTypeAnnotation = route.propsType ? `<${route.propsType}>` : "";

          return `  { 
    path: '${route.path}', 
    name: '${route.name}', 
    props: ${route.props}, 
    exact: ${route.exact}, 
    beforeEntry: ${route.beforeEntry}, 
    afterEntry: ${route.afterEntry}, 
    component${propsTypeAnnotation}: ${route.className} 
  },`;
        })
        .join("\n");

      const registryContent = `${importStatements}\n\nexport const routes = [\n${routeMappings}\n];\n`;

      fs.writeFileSync(registryPath, registryContent);
      console.info(`Route registry generated at ${registryPath}`);
    }
  };
});

function serializeExpression(expr) {
  const { code } = generate(expr, { concise: true });
  return code;
}
