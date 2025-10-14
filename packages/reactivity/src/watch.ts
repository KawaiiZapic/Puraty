import { isRef, onUpdateSymbol } from ".";

export interface WatchOptions {
	immediate: boolean;
}

export const watch = <T>(v: T, handler: () => void, options?: WatchOptions) => {
	isRef(v) &&
		setTimeout(() =>
			v[onUpdateSymbol](() => {
				handler();
			})
		);
	if (options?.immediate) {
		handler();
	}
};
