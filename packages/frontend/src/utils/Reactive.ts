const delayed = <T extends () => void>(fn: T): T => {
  let im: number | null = null;
  return ((...args) => {
    im = setTimeout(() => {
      im != null && clearTimeout(im);
      fn.apply(null, args);
    });
  }) as T
}

export const ref = <T>(value: T): Ref<T> => {
  const updateHandler: (() => void)[] = [];
  const flush = delayed(() => updateHandler.forEach(fn => fn()));
  return new Proxy({
    value,
    onUpdate(fn) {
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

export const reactive = <T extends object>(value: T): T => {
  if (typeof (value as any).onUpdate === "function") return value;
  const updateHandler: (() => void)[] = [];
  const flush = delayed(() => updateHandler.forEach(fn => fn()));
  return new Proxy({
    ...value,
    onUpdate(fn: () => void) {
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

export const computed = <T, R>(fn: (state: T) => R, state: T): Ref<R> => {
  const updateHandler: (() => void)[] = [];
  const flush = delayed(() => {
    const n = fn(state);
    if (n !== res.value) {
      res.value = n;
      updateHandler.forEach(fn => fn());
    }
  });
  const res = {
    value: fn(state),
    onUpdate(fn: () => void) {
      updateHandler.push(() => fn());
    }
  };
  if (typeof (state as any).onUpdate === "function") {
    (state as any).onUpdate(flush);
  }
  return res;
};

export const toRef = <T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]> => {
  const res = ref(object[key]);
  if (typeof (object as any).onUpdate === "function") {
    const flush = delayed(() => {
      res.value = object[key];
    });
    (object as any).onUpdate(flush);
  }
  return res;
}

export const rNode = <T extends Record<string | symbol, unknown>>(fn: (state: T) => JSX.Element, state: T) => {
  const reactiveState = reactive(state);
  (reactiveState as any).onUpdate(() =>  {
    const newEl = fn(reactiveState);
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