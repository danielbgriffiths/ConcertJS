module.exports = function ({ types: t }) {
  return {
    name: "register-concert-directives",
    visitor: {
      Program(path) {
        const directives = [];

        path.traverse({
          ClassDeclaration(classPath) {
            const decorators = classPath.node.decorators || [];
            decorators.forEach(decorator => {
              if (
                t.isCallExpression(decorator.expression) &&
                decorator.expression.callee.name === "Directive"
              ) {
                const args = decorator.expression.arguments;
                if (args.length > 0 && t.isArrayExpression(args[0])) {
                  args[0].elements.forEach(element => {
                    if (t.isArrayExpression(element) && element.elements.length === 2) {
                      const nameNode = element.elements[0];
                      const funcNode = element.elements[1];
                      if (t.isStringLiteral(nameNode) && t.isIdentifier(funcNode)) {
                        directives.push({
                          name: nameNode.value,
                          func: funcNode.name
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        });

        if (directives.length > 0) {
          const registerDirectiveImportDeclaration = t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier("registerDirective"),
                t.identifier("registerDirective")
              )
            ],
            t.stringLiteral("@concertjs/core")
          );
          path.unshiftContainer("body", registerDirectiveImportDeclaration);

          const applyDirectivesImportDeclaration = t.importDeclaration(
            [t.importSpecifier(t.identifier("applyDirectives"), t.identifier("applyDirectives"))],
            t.stringLiteral("@concertjs/core")
          );
          path.unshiftContainer("body", applyDirectivesImportDeclaration);

          directives.forEach(({ name, func }) => {
            const registerCall = t.expressionStatement(
              t.callExpression(t.identifier("registerDirective"), [
                t.stringLiteral(name),
                t.identifier(func)
              ])
            );
            path.pushContainer("body", registerCall);
          });
        }
      }
    }
  };
};
