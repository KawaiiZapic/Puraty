import { isRef, onUpdateSymbol, type Ref } from ".";

export interface WatchOptions {
  immediate: boolean;
}

export const watch = <T>(
  v: unknown,
  handler: () => void,
  options?: WatchOptions
) => {
  isRef(v) && setTimeout(() => v[onUpdateSymbol](() => {
    handler();
  }))
  if (options?.immediate) {
    handler();
  }
}