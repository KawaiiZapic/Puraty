/**
 * Simulate original behavior of Venera setTimeout
 * pass native function as callback may cause error
 */
const _setTimeout: typeof setTimeout = (
  handler,
  timeout
) => {
  return setTimeout(
    typeof handler === "function" ? () => handler() : handler, 
    timeout
  );
}

const createUuid = (): string => {
  return crypto.randomUUID();
}

const randomDouble = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
}

const randomInt = (min: number, max: number): number => {
  return Math.ceil(randomDouble(min, max));
}

class _Timer {
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
        _setTimeout(this._interval.bind(this), this.delay);
    }

    cancel() {
        this.status = false;
    }
}

const _setInterval = (callback: Function, delay: number) => {
    let timer = new _Timer(delay, callback);
    timer.run();
    return timer;
}

let _console = {
  log: (content: unknown) => {
    console.log('[ComicSource]', content)
  },
  warn: (content: unknown) => {
    console.warn('[ComicSource]', content)
  },
  error: (content: unknown) => {
    console.error('[ComicSource]', content)
  },
};
