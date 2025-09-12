const createReactiveState = <T extends Record<string | symbol, unknown>>(state: T, onUpdate: () => void): T => {
  let im: number | null = null;
  return new Proxy(state, {
    set(target, p, newValue, receiver) {
        (target as any)[p] = newValue;
        im = setTimeout(() => {
          im != null && clearTimeout(im);
          onUpdate();
        });
        return true;
    },
  });
}

export const rNode = <T extends Record<string | symbol, unknown>>(fn: (state: T) => JSX.Element, state: T) => {
  const reactiveState = createReactiveState(state, () =>  {
    const newEl = fn(state);
    el.parentNode?.replaceChild(newEl, el);
    el = newEl;
  });
  let el: JSX.Element = fn(reactiveState);
  return {
    state: reactiveState,
    $() {
      return el;
    }
  };
}