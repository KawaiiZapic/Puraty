import type { FunctionalComponent } from "preact";

const LoadingWrapper: FunctionalComponent<{
	onRetry?: () => void;
	loading: boolean;
	errorMsg?: string;
	class?: string;
	style?: string;
}> = ({ onRetry, loading, errorMsg, children, class: className, style }) => {
	const btnText = loading ? "正在加载" : "重试";
	const btnStyle = !errorMsg ? "display: none" : "";
	const showWrapper = !!errorMsg || loading;
	const tipText = errorMsg || "正在加载...";

	return showWrapper ? (
		<div
			style={style ?? "padding: 2rem 0; text-align: center"}
			class={className}
		>
			<div style="padding: 1rem 0;">{tipText}</div>
			{onRetry && (
				<button
					style={btnStyle}
					disabled={loading}
					onClick={() => {
						onRetry!();
					}}
				>
					{btnText}
				</button>
			)}
		</div>
	) : (
		<>{children}</>
	);
};

export default LoadingWrapper;
