import type { RefLike } from ".";

let currentTracker: Tracker | null = null;

export class Tracker {
	private collecting: boolean = false;
	private values: Set<RefLike> = new Set();

	trackStart() {
		this.collecting = true;
		this.values.clear();
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		currentTracker = this;
	}
	track(v: RefLike) {
		if (!this.collecting) return;
		this.values.add(v);
	}
	collect() {
		this.collecting = false;
		const v = Array.from(this.values);
		this.values.clear();
		currentTracker = null;
		return v;
	}
}

export const track = (v: RefLike) => {
	currentTracker?.track(v);
};

export const createTracker = (): Tracker => {
	return new Tracker();
};
