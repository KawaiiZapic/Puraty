/**
 * Simulate original behavior of Venera setTimeout
 * pass native function as callback may cause error
 */
export const setTimeout: typeof globalThis.setTimeout = (
  handler,
  timeout
) => {
  return globalThis.setTimeout(
    typeof handler === "function" ? () => handler() : handler, 
    timeout
  );
}

export const createUuid = (): string => {
  return crypto.randomUUID();
}

export const randomDouble = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
}

export const randomInt = (min: number, max: number): number => {
  return Math.ceil(randomDouble(min, max));
}

export class _Timer {
    delay = 0;

    callback: Function = () => { };

    status = false;

    constructor(delay: number, callback: Function) {
        this.delay = delay;
        this.callback = callback;
    }

    run() {
        this.status = true;
        this._interval();
    }

    _interval() {
        if (!this.status) {
            return;
        }
        this.callback();
        setTimeout(this._interval.bind(this), this.delay);
    }

    cancel() {
        this.status = false;
    }
}

export const setInterval = (callback: Function, delay: number) => {
    let timer = new _Timer(delay, callback);
    timer.run();
    return timer;
}

export const console = {
  log: (content: unknown) => {
    globalThis.console.log('[ComicSource]', content)
  },
  warn: (content: unknown) => {
    globalThis.console.warn('[ComicSource]', content)
  },
  error: (content: unknown) => {
    globalThis.console.error('[ComicSource]', content)
  },
};
