const { declare } = require("@babel/helper-plugin-utils");
const t = require("@babel/types");

function extractAttributeValue(attr) {
  if (!attr.value) return t.booleanLiteral(true);
  if (t.isJSXExpressionContainer(attr.value)) return attr.value.expression;
  return attr.value;
}

function extractAttributes(attributes) {
  let ifAttr = null;
  let elseIfAttr = null;
  let elseAttr = null;
  let switchAttr = null;
  let pendingAttr = null;
  let rejectedAttr = null;
  let mapAttr = null;
  let forAttr = null;
  let ofAttr = null;
  let propsAttrs = [];

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const attrName = attr.name.name;
    switch (attrName) {
      case "if":
        ifAttr = extractAttributeValue(attr);
        break;
      case "else-if":
        elseIfAttr = extractAttributeValue(attr);
        break;
      case "else":
        elseAttr = true;
        break;
      case "switch":
        switchAttr = extractAttributeValue(attr);
        break;
      case "pending":
        pendingAttr = extractAttributeValue(attr);
        break;
      case "fallback":
      case "rejected":
        rejectedAttr = extractAttributeValue(attr);
        break;
      case "map":
        mapAttr = extractAttributeValue(attr);
        break;
      case "for":
        forAttr = extractAttributeValue(attr);
        break;
      case "of":
        ofAttr = extractAttributeValue(attr);
        break;
      default:
        propsAttrs.push(attr);
        break;
    }
  }

  return {
    ifAttr,
    elseIfAttr,
    elseAttr,
    switchAttr,
    pendingAttr,
    rejectedAttr,
    mapAttr,
    forAttr,
    ofAttr,
    propsAttrs
  };
}

function extractCase(switchAttr, childNode) {
  const caseAttr = childNode.openingElement.attributes.find(attr => attr.name.name === "case");

  if (!caseAttr) return;

  const caseAttrValue = extractAttributeValue(caseAttr);

  childNode.openingElement.attributes = childNode.openingElement.attributes.filter(
    attr => attr.name.name !== "case"
  );

  return {
    caseValue: caseAttrValue.value === true ? switchAttr : caseAttrValue,
    consequent: childNode
  };
}

function buildProps(propsAttrs) {
  return propsAttrs.length > 0
    ? t.objectExpression(
        propsAttrs.map(attr => {
          const attrName = attr.name.name;
          const attrValue = extractAttributeValue(attr);

          if (t.isCallExpression(attrValue)) {
            return t.objectProperty(t.identifier(attrName), wrapReactiveExpression(attrValue));
          }

          return t.objectProperty(t.identifier(attrName), attrValue);
        })
      )
    : t.nullLiteral();
}

function createMapElement(mapAttr, nodeChildren) {
  return t.callExpression(t.memberExpression(mapAttr, t.identifier("map")), [nodeChildren[0]]);
}

function createForOfElement(forAttr, ofAttr, tagName, props) {
  const itemIdentifier = t.identifier(ofAttr.params[0].name);

  const propsObject = t.isObjectExpression(props) ? props : t.objectExpression([]);

  const updatedProps = t.objectExpression([
    ...propsObject.properties,
    t.objectProperty(itemIdentifier, itemIdentifier)
  ]);

  return t.callExpression(t.memberExpression(forAttr, t.identifier("map")), [
    t.arrowFunctionExpression(
      [itemIdentifier],
      t.callExpression(t.identifier("h"), [t.identifier(tagName), updatedProps])
    )
  ]);
}

function createSwitchElement(switchAttr, cases) {
  let switchExpression = t.nullLiteral();
  for (let i = cases.length - 1; i >= 0; i--) {
    const { caseValue, consequent } = cases[i];
    switchExpression = t.conditionalExpression(
      t.binaryExpression("===", switchAttr, caseValue),
      consequent,
      switchExpression
    );
  }
  return switchExpression;
}

function createHElement(tagName, props, nodeChildren) {
  const isComponent = /^[A-Z]/.test(tagName);

  const tagExpression = isComponent ? t.identifier(tagName) : t.stringLiteral(tagName);

  return t.callExpression(t.identifier("h"), [tagExpression, props, ...nodeChildren]);
}

function createHandleAsyncElement(element, pendingAttr, rejectedAttr) {
  return t.callExpression(t.identifier("handleAsync"), [
    element,
    pendingAttr || t.nullLiteral(),
    rejectedAttr || t.nullLiteral()
  ]);
}

function processIfElseChain(path) {
  const elements = [];
  let nextSibling = path.getSibling(path.key + 1);

  const { ifAttr, elseIfAttr, elseAttr } = extractAttributes(path.node.openingElement.attributes);

  if (ifAttr || elseIfAttr || elseAttr) {
    elements.push({ node: path.node, ifAttr, elseIfAttr, elseAttr });

    path.node.openingElement.attributes = path.node.openingElement.attributes.filter(attr => {
      const attrName = attr.name.name;
      return attrName !== "if" && attrName !== "else-if" && attrName !== "else";
    });

    let limit = 10;

    while (nextSibling && nextSibling.isJSXElement() && limit > 0) {
      const siblingAttributes = extractAttributes(nextSibling.node.openingElement.attributes);

      if (siblingAttributes.elseIfAttr || siblingAttributes.elseAttr) {
        elements.push({
          node: nextSibling.node,
          ifAttr: siblingAttributes.elseIfAttr,
          elseAttr: siblingAttributes.elseAttr
        });

        nextSibling.node.openingElement.attributes =
          nextSibling.node.openingElement.attributes.filter(attr => {
            const attrName = attr.name.name;
            return attrName !== "else-if" && attrName !== "else";
          });

        nextSibling = nextSibling.getSibling(nextSibling.key + 1);
        limit--;
      } else {
        break;
      }
    }
  }

  return elements;
}

function buildTernaryChain(elements) {
  let ternaryExpression = t.nullLiteral();

  for (let i = elements.length - 1; i >= 0; i--) {
    const { ifAttr, elseIfAttr, elseAttr, node } = elements[i];

    if (elseAttr) {
      ternaryExpression = node;
    } else if (elseIfAttr || ifAttr) {
      const condition = ifAttr || elseIfAttr;
      ternaryExpression = t.conditionalExpression(condition, node, ternaryExpression);
    }
  }

  return ternaryExpression;
}

function wrapReactiveExpression(expression) {
  return t.arrowFunctionExpression([], expression);
}

function transformElementToExpression(node) {
  const openingElement = node.openingElement;
  const tagName = openingElement.name.name;

  const { propsAttrs, switchAttr, mapAttr, pendingAttr, rejectedAttr, forAttr, ofAttr } =
    extractAttributes(openingElement.attributes);

  openingElement.attributes = propsAttrs;

  let cases = [];
  let nodeChildren = [];
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (!text) continue;
      nodeChildren.push(t.stringLiteral(text));
      continue;
    }

    if (t.isCallExpression(child.expression)) {
      nodeChildren.push(wrapReactiveExpression(child.expression));
      continue;
    }

    if (t.isJSXExpressionContainer(child)) {
      nodeChildren.push(wrapReactiveExpression(child.expression));
      continue;
    }

    if (t.isJSXElement(child)) {
      if (switchAttr) {
        const nodeCase = extractCase(switchAttr, child);
        if (nodeCase) {
          cases.push(nodeCase);
          continue;
        }
      }

      nodeChildren.push(child);
    }
  }

  const props = buildProps(propsAttrs);

  let element;

  if (forAttr && ofAttr) {
    element = createForOfElement(forAttr, ofAttr, tagName, props);
  } else if (mapAttr) {
    element = createHElement(tagName, props, [createMapElement(mapAttr, nodeChildren)]);
  } else if (switchAttr) {
    element = createHElement(tagName, props, [
      wrapReactiveExpression(createSwitchElement(switchAttr, cases))
    ]);
  } else if ((pendingAttr || rejectedAttr) && nodeChildren.length) {
    element = createHElement(tagName, props, [
      createHandleAsyncElement(nodeChildren[0], pendingAttr, rejectedAttr)
    ]);
  } else {
    element = createHElement(tagName, props, nodeChildren);
  }

  return element;
}

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-concertjs-jsx",
    visitor: {
      JSXElement(path) {
        const ifElseChain = processIfElseChain(path);

        if (ifElseChain.length > 0) {
          const ternaryExpression = buildTernaryChain(ifElseChain);
          path.replaceWith(ternaryExpression);
        } else {
          const element = transformElementToExpression(path.node);
          path.replaceWith(element);
        }
      },
      JSXFragment(path) {
        const { children } = path.node;

        const transformedChildren = children
          .map(child => {
            if (t.isJSXText(child) && /^\s*$/.test(child.value)) {
              return null;
            }
            if (t.isJSXExpressionContainer(child)) {
              return wrapReactiveExpression(child.expression);
            }
            return child;
          })
          .filter(child => child !== null);

        const arrayExpression = t.arrayExpression(transformedChildren);

        path.replaceWith(arrayExpression);
      }
    }
  };
});
