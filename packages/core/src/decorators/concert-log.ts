import { _ElementDescriptor } from "../types";

export function ConcertLog(element: _ElementDescriptor): any {
  const { kind, elements } = element;

  if (kind !== "class") return element;

  return {
    ...element,
    finisher(cls: FunctionConstructor): void {
      const renderFn: _ElementDescriptor | undefined = elements.find(
        (el: _ElementDescriptor) => el.key === "render"
      );

      if (!renderFn || renderFn.kind !== "method") return;

      const originalMethod = renderFn.descriptor.value;

      Object.defineProperty(cls, "render", {
        ...renderFn.descriptor,
        value: function (...args: any[]) {
          console.info(`Calling ${cls.name}.render with: `, args);
          return originalMethod.apply(this, args);
        }
      });
    }
  };
}
