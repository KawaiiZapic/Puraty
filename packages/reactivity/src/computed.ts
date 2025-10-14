import { delayed } from "./utils";

import { onUpdateSymbol, watch, type Ref } from ".";

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
		[onUpdateSymbol]: (fn: () => void) => {
			updateHandler.push(() => fn());
		}
	};
	watch(state as Ref, flush);
	return res;
};
