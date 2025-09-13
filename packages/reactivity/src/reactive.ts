import { onUpdateSymbol } from ".";
import { delayed } from "./utils";

export const reactive = <T extends object>(value: T): T => {
  if (typeof (value as any)[onUpdateSymbol] === "function") return value;
  const updateHandler: (() => void)[] = [];
  const flush = delayed(() => updateHandler.forEach(fn => fn()));
  return new Proxy({
    ...value,
    [onUpdateSymbol]: (fn: () => void) => {
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
