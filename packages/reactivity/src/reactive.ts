import { delayed } from "./utils";

import { onUpdateSymbol } from ".";

export const reactive = <T extends object>(value: T): T => {
	if (typeof (value as never)[onUpdateSymbol] === "function") return value;
	const updateHandler: (() => void)[] = [];
	const flush = delayed(() => updateHandler.forEach(fn => fn()));
	return new Proxy(
		{
			...value,
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
			}
		}
	);
};
