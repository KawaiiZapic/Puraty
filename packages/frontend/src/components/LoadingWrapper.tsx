import { computed, shallowReactive, toRef } from "@puraty/reactivity";

export default (onRetry: () => void) => {
	const state = shallowReactive({
		loading: true,
		errorMsg: ""
	});
	const disabled = toRef(state, "loading");

	const btnText = computed(() => {
		return state.loading ? "正在加载" : "重试";
	});
	const btnStyle = computed(() => {
		return !state.errorMsg ? "display: none" : "";
	});

	const wrapperStyle = computed(() => {
		return !!state.errorMsg || state.loading
			? "padding: 2rem 0; text-align: center"
			: "display: none";
	});

	const tipText = computed(() => {
		return state.errorMsg || "正在加载...";
	});
	const $ = (
		<div style={wrapperStyle}>
			<div style="padding: 1rem 0;">{tipText}</div>
			<button
				style={btnStyle}
				disabled={disabled}
				onClick={() => {
					onRetry();
				}}
			>
				{btnText}
			</button>
		</div>
	);

	return {
		state,
		$
	};
};
