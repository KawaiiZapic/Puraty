export const delayed = <T extends () => void>(fn: T): T => {
	let im: number | null = null;
	return ((...args) => {
		im != null && clearTimeout(im);
		im = setTimeout(() => {
			fn(...args);
		});
	}) as T;
};
