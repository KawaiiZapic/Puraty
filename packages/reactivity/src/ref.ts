import { onUpdateSymbol, type Ref } from ".";
import { delayed } from "./utils";

export const ref = <T>(value: T): Ref<T> => {
  const updateHandler: (() => void)[] = [];
  const flush = delayed(() => updateHandler.forEach(fn => fn()));
  return new Proxy({
    value,
    [onUpdateSymbol]: (fn) => {
      updateHandler.push(fn);
    }
  }, {
    set(target, p, newValue, receiver) {
        (target as any)[p] = newValue;
        flush();
        return true;
    },
  });
}