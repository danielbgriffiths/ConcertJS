declare namespace JSX {
  type ElementTypes =
    | number
    | string
    | boolean
    | object
    | HTMLElement
    | DocumentFragment
    | null
    | undefined;

  type Element = ElementTypes | ElementTypes[];

  interface IntrinsicElements {
    div: any;
    span: any;
    button: any;
    [key: string]: any;
  }

  interface IntrinsicAttributes {
    for: any;
    of: any;
    map: any;
    if: any;
    else: any;
    "else-if": any;
    switch: any;
    case: any;
    pending: any;
    rejected: any;
    class: string;
  }

  interface ElementChildrenAttribute {
    children?: {};
  }
}
