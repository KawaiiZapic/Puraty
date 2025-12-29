export class LRU<T = unknown> {
	private cache: Map<string, T>;
	private maxSize: number;

	constructor(maxSize: number) {
		this.cache = new Map();
		this.maxSize = maxSize;
	}

	get(key: string): T | void {
		const value = this.cache.get(key);
		if (!value) return;
		this.cache.delete(key);
		this.cache.set(key, value!);

		return value;
	}

	set(key: string, value: T): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		} else if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			firstKey && this.cache.delete(firstKey);
		}

		this.cache.set(key, value);
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}

	keys(): MapIterator<string> {
		return this.cache.keys();
	}

	values(): MapIterator<T> {
		return this.cache.values();
	}
}
