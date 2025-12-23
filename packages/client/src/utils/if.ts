export class IfCondition<T> {
	private conditionResult?: unknown;
	private hasMatched = false;

	constructor() {}

	ElseIf(when: unknown): <R>(result: R) => IfCondition<T | R> {
		return result => {
			if (!this.hasMatched && !!when) {
				this.hasMatched = true;
				this.conditionResult = result;
			}
			return this;
		};
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

export const If = (when: unknown): (<T>(result: T) => IfCondition<T>) => {
	return new IfCondition().ElseIf(when) as never;
};
