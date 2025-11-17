const tasks = new Set<() => void>();
let nextTickHandler: Promise<void> | null = null;

const startNextTick = () => {
	if (nextTickHandler != null) return;
	nextTickHandler = Promise.resolve().then(() => {
		tasks.forEach(fn => fn());
		tasks.clear();
		nextTickHandler = null;
	});
};

export const nextTick = <T extends () => void>(fn: T): Promise<void> => {
	tasks.add(() => fn());
	startNextTick();
	return nextTickHandler!;
};

export const delayed = <T extends () => void>(fn: T): T => {
	return ((...args) => {
		tasks.add(() => fn(...args));
		startNextTick();
	}) as T;
};
