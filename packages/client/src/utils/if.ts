export class IfCondition<T> {
	private conditionResult?: unknown;
	private hasMatched = false;

	constructor(when: unknown, result: T) {
		if (when) {
			this.conditionResult = result;
			this.hasMatched = true;
		}
	}

	ElseIf<R>(when: unknown, result: R): IfCondition<T | R> {
		if (!this.hasMatched && !!when) {
			this.conditionResult = result;
			this.hasMatched = true;
		}
		return this;
	}

	Else(): T | undefined;
	Else<R>(result: R): T | R;
	Else<R>(result?: R): T | R {
		if (!this.hasMatched) {
			this.conditionResult = result;
		}
		return this.conditionResult as T | R;
	}

	End() {
		return this.conditionResult as T | undefined;
	}
}

export const If = <T>(when: unknown, result: T) => {
	return new IfCondition<T>(when, result);
};
