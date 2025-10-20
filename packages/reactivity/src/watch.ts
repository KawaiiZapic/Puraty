import { isRef, onUpdateSymbol } from ".";

export interface WatchOptions {
	immediate?: boolean;
	signal?: AbortSignal;
}

export const watch = <T>(v: T, handler: () => void, options?: WatchOptions) => {
	if (isRef(v)) {
		setTimeout(() => {
			if (options?.signal?.aborted) return;
			const s = v[onUpdateSymbol](() => {
				handler();
			});
			if (options?.signal) {
				options.signal.addEventListener("abort", () => {
					s();
				});
			}
		});
	}
	if (options?.immediate) {
		handler();
	}
};
