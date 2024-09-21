let nodeCounter = 1;

export const ROOT_UID = "node-0";

export function createUID(): string {
  return `node-${nodeCounter++}`;
}
