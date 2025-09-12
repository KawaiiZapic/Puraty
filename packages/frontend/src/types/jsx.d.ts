declare global {
  type IntrinsicElementsHTML = import("tsx-dom").IntrinsicElementsHTML;
  type CustomElementsHTML = import("tsx-dom").CustomElementsHTML;
  type ComponentChild = import("tsx-dom").ComponentChild;
  type RefCompChild = Ref<Exclude<ComponentChild, unknown[]>> | ComponentChild;
  interface Ref<T> {
    value: T;
    onUpdate: (fn: () => void) => void
  }
  type RefAttr<T> = {
    [K in keyof T]?: K extends "children" ? (RefCompChild | RefCompChild[]) : Ref<Extract<T[K], string | boolean | undefined>> | T[K];
  };
  type RefElements<T> = {
    [K in keyof T]: RefAttr<T[K]>;
  };
  namespace JSX {
    interface IntrinsicElements extends RefElements<IntrinsicElementsHTML>, IntrinsicElementsHTML, CustomElementsHTML {
    };
  }
}

export {};