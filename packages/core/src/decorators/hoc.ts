import { _ElementDescriptor } from "../types";

// TODO: Better define the value of this decorator. Not sure if it is a keeper.
export function HOC(hocFn: Function) {
  return function (element: _ElementDescriptor): void {
    const originalMethod = element.descriptor.value;
    element.descriptor.value = function (...args: any[]) {
      const renderFn = hocFn(originalMethod.bind(this, args));
      return renderFn(...args);
    };
  };
}
