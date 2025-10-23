import { getCurrentEffectScope } from "./effectScope";
import { createTracker } from "./tracker";
import { delayed } from "./utils";

import { onUpdateSymbol, ref, type ReadOnlyRef } from ".";

export const computed = <T>(fn: () => T): ReadOnlyRef<T> => {
	const scope = getCurrentEffectScope();
	const value = ref<T>(undefined as T);
	const watchers: (() => void)[] = [];
	const cleanWatchers = () => {
		watchers.forEach(fn => fn());
		watchers.splice(0, watchers.length);
	};
	const tracker = createTracker();
	const update = () => {
		tracker.trackStart();
		value.value = fn();
		const tracked = tracker.collect();
		cleanWatchers();
		tracked.forEach(v => {
			watchers.push(v[onUpdateSymbol](delayedUpdate));
		});
	};
	const delayedUpdate = delayed(update);
	update();
	scope?.onDispose(cleanWatchers);
	return value;
};
