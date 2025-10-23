import { getCurrentEffectScope } from "./effectScope";
import { track } from "./tracker";
import { delayed } from "./utils";

import { onUpdateSymbol, type Ref } from ".";

export const ref = <T>(value: T): Ref<T> => {
	const updateHandler: (() => void)[] = [];
	const flush = delayed(() => updateHandler.forEach(fn => fn()));
	const v: Ref<T> = new Proxy(
		{
			value,
			[onUpdateSymbol]: (fn: () => void) => {
				updateHandler.push(fn);
				return () => {
					updateHandler.splice(updateHandler.indexOf(fn), 1);
				};
			}
		},
		{
			set(target, p, newValue) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(target as any)[p] = newValue;
				flush();
				return true;
			},
			get(t, k) {
				if (k === "value") {
					track(v);
				}
				return (t as never)[k];
			}
		}
	) as Ref<T>;
	return v;
};
