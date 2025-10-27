const oFetch = globalThis.fetch;

globalThis.fetch = async function (...args) {
	const res = await oFetch.apply(globalThis, args);
	res.text = async function () {
		return new TextDecoder().decode(await res.arrayBuffer());
	};
	return res;
};

globalThis.AbortSignal.timeout = (timeout: number) => {
	const ab = new AbortController();
	setTimeout(() => {
		ab.abort();
	}, timeout);
	return ab.signal;
};
