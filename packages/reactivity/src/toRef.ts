import { onUpdateSymbol, type Ref } from ".";
import { ref } from "./ref";
import { delayed } from "./utils";

export const toRef = <T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]> => {
  const res = ref(object[key]);
  if (typeof (object as any)[onUpdateSymbol] === "function") {
    const flush = delayed(() => {
      if (res.value === object[key]) return;
      res.value = object[key];
    });
    (object as any)[onUpdateSymbol](flush);
    const flush2 = delayed(() => {
      if (res.value === object[key]) return;
      object[key] = res.value;
    });
    res[onUpdateSymbol](flush2);
  }
  return res;
}