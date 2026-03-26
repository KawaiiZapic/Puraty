import type { FunctionalComponent } from "preact";

import { NetworkError } from "@/api";

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

export const useLoadingWrapper = function <T>(callback: () => Promise<T>) {
	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState<string>();
	const refresh = async () => {
		setLoading(true);
		setErrorMsg(void 0);
		try {
			await callback();
		} catch (e) {
			console.error(e);
			if (e instanceof Error) {
				if (e instanceof NetworkError) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					setErrorMsg((e.data as any)?.message ?? "网络错误");
				} else {
					setErrorMsg(e.message);
				}
			} else {
				setErrorMsg("加载失败");
			}
		} finally {
			setLoading(false);
		}
	};
	return {
		refresh,
		loading,
		errorMsg,
		LoadingWrapper: (({ children, style }) => {
			return (
				<LoadingWrapper
					loading={loading}
					errorMsg={errorMsg}
					onRetry={refresh}
					style={style}
				>
					{children}
				</LoadingWrapper>
			);
		}) satisfies FunctionalComponent<{ style?: string }>
	};
};
