import { watch, type WatchOptions } from "@puraty/reactivity";

export class Scope {
	private ac = new AbortController();
	constructor(public target: Element) {}

	bind(target: Element) {
		this.target = target;
	}

	dispose() {
		this.ac.abort();
	}

	withEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: Element, ev: HTMLElementEventMap[K]) => unknown,
		_options?: (AddEventListenerOptions & { target: EventTarget }) | boolean
	) {
		const realTarget =
			(typeof _options == "object" && _options.target) ||
			(this.target ?? window);
		const options: AddEventListenerOptions = {};
		if (typeof _options == "object") {
			Object.assign(options, _options);
		} else {
			options.capture = _options;
		}
		if (options.signal) {
			const selfAc = new AbortController();
			[options.signal, this.ac.signal].forEach(v =>
				v.addEventListener("abort", () => {
					if (!selfAc.signal.aborted) {
						selfAc.abort();
					}
				})
			);
			options.signal = selfAc.signal;
		} else {
			options.signal = this.ac.signal;
		}
		realTarget.addEventListener(
			type,
			listener.bind(realTarget as never) as never,
			options
		);
	}

	watch<T>(v: T, handler: () => void, options?: WatchOptions) {
		return watch(v, handler, {
			...options,
			signal: this.ac.signal
		});
	}
}
