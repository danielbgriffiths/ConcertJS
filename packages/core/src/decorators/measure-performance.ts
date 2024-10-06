import { _ElementDescriptor, MeasurePerformanceOptions } from "../types";

export function MeasurePerformance(options: MeasurePerformanceOptions) {
  return function (element: _ElementDescriptor): void {
    const originalMethod = element.descriptor.value;

    element.descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      console.info(`Execution time for ${options.name}: ${(end - start).toFixed(3)} ms`);
      return result;
    };
  };
}
