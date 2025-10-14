import { delayed } from "./utils";

import { onUpdateSymbol, type Ref } from ".";

export const ref = <T>(value: T): Ref<T> => {
	const updateHandler: (() => void)[] = [];
	const flush = delayed(() => updateHandler.forEach(fn => fn()));
	return new Proxy(
		{
			value,
			[onUpdateSymbol]: fn => {
				updateHandler.push(fn);
			}
		},
		{
			set(target, p, newValue) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(target as any)[p] = newValue;
				flush();
				return true;
			}
		}
	);
};
