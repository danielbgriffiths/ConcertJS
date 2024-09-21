declare namespace JSX {
  type Element = string | HTMLElement | HTMLElement[] | DocumentFragment | null;

  interface IntrinsicElements {
    div: any;
    span: any;
    button: any;
    [key: string]: any;
  }

  interface ElementChildrenAttribute {
    children?: {};
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
  }
}
