export function ConcertLog(element: any): any {
  const { kind, elements } = element;

  if (kind !== "class") return element;

  return {
    ...element,
    finisher(cls: any) {
      const className = cls.name;
      elements.forEach((el: any) => {
        if (el.kind === "method") {
          const originalMethod = el.descriptor.value;
          const methodName = el.key;

          if (el.placement === "static") {
            Object.defineProperty(cls, methodName, {
              ...el.descriptor,
              value: function (...args: any[]) {
                console.info(`Calling ${className}.${methodName.toString()} with: `, args);
                return originalMethod.apply(this, args);
              }
            });
          } else {
            Object.defineProperty(cls.prototype, methodName, {
              ...el.descriptor,
              value: function (...args: any[]) {
                console.info(`Calling ${className}.${methodName.toString()} with: `, args);
                return originalMethod.apply(this, args);
              }
            });
          }
        }
      });
    }
  };
}
