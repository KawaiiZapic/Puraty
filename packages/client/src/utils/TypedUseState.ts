import {
	useState as _s,
	useReducer as _r,
	type StateUpdater,
	type Dispatch,
	type Reducer
} from "preact/hooks";

interface SafeUseState {
	<S>(
		initialState: S | (() => S)
	): [Readonly<S>, Dispatch<StateUpdater<Readonly<S>>>];
	<S = undefined>(): [
		Readonly<S> | undefined,
		Dispatch<StateUpdater<Readonly<S> | undefined>>
	];
}

interface SafeUseReducer {
	<S, A>(
		reducer: Reducer<Readonly<S>, A>,
		initialState: S
	): [Readonly<S>, Dispatch<A>];
}

const useState = _s as SafeUseState;
const useReducer = _r as SafeUseReducer;

export { useState, useReducer };
