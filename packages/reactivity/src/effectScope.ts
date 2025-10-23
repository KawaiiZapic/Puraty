let currentEffectScope: EffectScope | null = null;

export const createEffectScope = (): EffectScope => {
	return new EffectScope();
};

export const getCurrentEffectScope = (): EffectScope | null => {
	return currentEffectScope;
};

export class EffectScope {
	private disposeHandler: Set<() => void> = new Set();
	private parentScope!: EffectScope | null;

	constructor() {
		this.use();
	}

	use() {
		if (currentEffectScope !== this) {
			this.parentScope = currentEffectScope;
		}
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		currentEffectScope = this;
	}
	end() {
		currentEffectScope = this.parentScope;
	}
	onDispose(fn: () => void) {
		this.disposeHandler.add(fn);
	}
	dispose() {
		for (const fn of this.disposeHandler) {
			fn();
		}
		this.disposeHandler.clear();
		currentEffectScope = this.parentScope;
	}
}
