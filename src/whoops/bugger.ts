/** It's not a debugger if it adds bugs (TM) */
export function bugger(s: any) {
  Object.assign(globalThis, s);
}
