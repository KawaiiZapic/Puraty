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

declare global {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Map<K, V> {
		toJSON(): Record<string, unknown>;
	}
}

globalThis.Map.prototype.toJSON = function () {
	const r: Record<string, unknown> = {};
	for (const [k, v] of this) {
		if (typeof k !== "string") return {};
		r[k] = v;
	}
	return r;
};

export {};
