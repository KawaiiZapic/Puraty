import { createRef, type RenderableProps } from "preact";

export interface PromptField {
	title?: string;
	key: string;
}
import style from "./Prompt.module.css";

export const Prompt = function <const T extends PromptField[]>({
	fields,
	title,
	onCancel,
	onSubmit
}: RenderableProps<{
	fields: T;
	title?: string;
	onCancel?: () => void;
	onSubmit?: (result: Record<T[number]["key"], string | undefined>) => void;
}>) {
	const formRef = createRef<HTMLFormElement>();
	const ref = createRef<HTMLDivElement>();
	const _onCancel = () => {
		onCancel?.();
	};
	const handleLayerOnclick = (e: MouseEvent) => {
		if (e.target !== ref.current) return;
		_onCancel();
	};

	const _onSubmit = () => {
		const f = new FormData(formRef.current!);
		const r: Record<string, string | undefined> = {};
		fields.forEach(field => {
			r[field.key] = f.get(field.key)?.toString();
		});
		onSubmit?.(r);
	};
	return (
		<div class={style.promptLayer} onClick={handleLayerOnclick} ref={ref}>
			<div class={style.promptDialog}>
				<div class={style.promptTitle}>{title}</div>
				<form ref={formRef}>
					{fields.map(field => {
						return (
							<div class={style.promptField}>
								<div class={style.promptFieldTitle}>
									{field.title ?? field.key}
								</div>
								<input name={field.key}></input>
							</div>
						);
					})}
				</form>
				<div class={style.promptBottom}>
					<button onClick={_onCancel}>取消</button>
					<button onClick={_onSubmit}>提交</button>
				</div>
			</div>
		</div>
	);
};
