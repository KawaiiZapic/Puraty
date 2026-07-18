import { type RenderableProps } from "preact";

export interface PromptField {
	title?: string;
	key: string;
}
import style from "./Prompt.module.css";

export const Confirm = function ({
	title,
	message,
	onCancel,
	onConfirm
}: RenderableProps<{
	title?: string;
	message: string;
	onCancel?: () => void;
	onConfirm?: () => void;
}>) {
	const ref = createRef<HTMLDivElement>();
	const _onCancel = () => {
		onCancel?.();
	};
	const handleLayerOnclick = (e: MouseEvent) => {
		if (e.target !== ref.current) return;
		_onCancel();
	};

	const _onConfirm = () => {
		onConfirm?.();
	};
	return (
		<div class={style.promptLayer} onClick={handleLayerOnclick} ref={ref}>
			<div class={style.promptDialog}>
				<div class={style.promptTitle}>{title}</div>
				<div>{message}</div>
				<div class={style.promptBottom}>
					<button onClick={_onCancel}>取消</button>
					<button onClick={_onConfirm}>确定</button>
				</div>
			</div>
		</div>
	);
};
