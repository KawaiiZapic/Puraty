import { onUpdateSymbol, type Ref } from ".";
import { ref } from "./ref";
import { delayed } from "./utils";

export const toRef = <T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]> => {
  const res = ref(object[key]);
  if (typeof (object as any)[onUpdateSymbol] === "function") {
    const flush = delayed(() => {
      res.value = object[key];
    });
    (object as any)[onUpdateSymbol](flush);
  }
  return res;
}