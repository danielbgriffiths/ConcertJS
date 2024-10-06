import { onMount } from "../render-engine";

export type ConcertDirectiveRegistration = [string, Function];

export function Directive(directives: ConcertDirectiveRegistration[]): Function {
  return function (target: any): void {};
}

const directiveRegistry: { [k: string]: Function } = {};

export function registerDirective(name: string, directiveFunction: Function): void {
  directiveRegistry[name] = directiveFunction;
}

function getRegisteredDirective(name: string): Function {
  return directiveRegistry[name];
}

export function applyDirectives(
  element: HTMLElement,
  directives: { name: string; value: Function }[]
): HTMLElement {
  onMount((): void => {
    directives.forEach(({ name, value }) => {
      const directive = getRegisteredDirective(name);

      if (!directive) {
        console.warn(`Directive "${name}" is not registered.`);
        return;
      }

      try {
        directive(element, value);
      } catch (error) {
        console.error(`Error applying directive "${name}":`, error);
      }
    });
  });

  return element;
}
