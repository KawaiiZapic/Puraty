export interface SharedData<T> {
	value: T;
	at: number;
}
const sharedData = new Map<string, SharedData<unknown>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSharedData = <T = any>(
	group: string,
	init?: T
): {
	value: T;
} => {
	// history index is not supported in Chrome before 102
	// history index is count manually by ourself
	const historyIdx = history.state?.historyIndex ?? 99999;
	const groupId = `${group}@${historyIdx}`;
	if (!sharedData.has(groupId)) {
		sharedData.set(groupId, { value: undefined, at: historyIdx });
	}
	const data = sharedData.get(groupId)!;
	if (data.value === undefined) {
		data.value = init;
	}
	return {
		get value() {
			return data.value as T;
		},
		set value(newValue) {
			data.value = newValue;
		}
	};
};

window.addEventListener(
	"popstate",
	() => {
		if (typeof history.state?.historyIndex !== "number") return;
		sharedData.forEach((data, k) => {
			if (data.at > history.state.historyIndex) {
				sharedData.delete(k);
			}
		});
	},
	{ capture: true, passive: true }
);
