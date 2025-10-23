import { getCurrentEffectScope } from "./effectScope";

import { isRefLike, onUpdateSymbol } from ".";

export interface WatchOptions {
	immediate?: boolean;
	signal?: AbortSignal;
}

export const watch = <T>(v: T, handler: () => void, options?: WatchOptions) => {
	if (isRefLike(v)) {
		const scope = getCurrentEffectScope();
		setTimeout(() => {
			if (options?.signal?.aborted) return;
			const s = v[onUpdateSymbol](() => {
				handler();
			});
			scope?.onDispose(s);
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
