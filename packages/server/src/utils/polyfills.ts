const oFetch = globalThis.fetch;

globalThis.fetch = async function fetch(...args) {
	const stack = new Error().stack;
	try {
		const res = await oFetch.apply(globalThis, args);
		res.text = async function () {
			return new TextDecoder().decode(await res.arrayBuffer());
		};
		return res;
	} catch (e) {
		if (e instanceof Error) {
			if (e.message.startsWith("Network request failed")) {
				e.stack = stack;
			}
		}
		throw e;
	}
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

Object.defineProperty(globalThis.Map.prototype, "toJSON", {
	enumerable: false,
	value: function () {
		const r: Record<string, unknown> = {};
		for (const [k, v] of this) {
			if (typeof k !== "string") return {};
			r[k] = v;
		}
		return r;
	}
});

export {};
