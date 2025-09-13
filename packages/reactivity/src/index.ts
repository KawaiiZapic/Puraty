export * from "./computed";
export * from "./isRef";
export * from "./reactive";
export * from "./ref";
export * from "./toRef";
export * from "./watch";

export const onUpdateSymbol = Symbol();

export interface Ref<T = unknown> {
  value: T;
  [onUpdateSymbol]: (fn: () => void) => void;
}