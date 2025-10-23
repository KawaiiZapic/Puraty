export * from "./computed";
export * from "./isRef";
export * from "./reactive";
export * from "./ref";
export * from "./toRef";
export * from "./watch";
export * from "./effectScope";
export * from "./tracker";

export const onUpdateSymbol = Symbol("onUpdate");

export interface Ref<T = unknown> extends RefLike {
	value: T;
}

export interface ReadOnlyRef<T = unknown> extends RefLike {
	readonly value: T;
}

export interface RefLike {
	[onUpdateSymbol]: (fn: () => void) => () => void;
}
