import type { AppConfig } from "@puraty/server";
import type { VNode } from "preact";

import api from "@/api";
import { useModal } from "@/components";
import { getConfig, initConfig } from "@/utils/config";

import style from "./index.module.css";

interface ConfigItem {
	type: "input" | "switch" | "select";
	title: string;
	options?: {
		text: string;
		value: string;
	}[];
	buttonText?: string;
	description?: string;
}

export const keys = <T extends object>(obj: T): (keyof T)[] => {
	return Object.keys(obj) as (keyof T)[];
};
const ConfigList: Record<keyof AppConfig, ConfigItem> = {
	httpProxy: {
		type: "input",
		title: "HTTP 代理",
		description: "代理地址，如 http://127.0.0.1:7890"
	},
	readerPreloadPages: {
		type: "select",
		title: "向后预加载页数",
		options: [
			{
				text: "1",
				value: "1"
			},
			{
				text: "3",
				value: "3"
			},
			{
				text: "5",
				value: "5"
			},
			{
				text: "10",
				value: "10"
			}
		]
	}
};
export default () => {
	const modal = useModal();
	const current = getConfig();

	const applyNewConfig = useMemo(() => {
		let timeout = 0;
		const applyNewConfig = (result: AppConfig, immediate = false) => {
			if (!immediate) {
				clearTimeout(timeout);
				timeout = setTimeout(() => applyNewConfig(result, true), 2000);
				return;
			}
			api.App.modifyConfig(result as unknown as Record<string, unknown>).then(
				({ ignoredKeys }) => {
					if (ignoredKeys.length) {
						modal.alert(
							`${ignoredKeys.map(v => ConfigList[v as keyof AppConfig]?.title ?? v).join(", ")}的值无效`
						);
					}
					initConfig();
				}
			);
		};
		return applyNewConfig;
	}, []);

	return (
		<form>
			{keys(ConfigList).map(k => {
				const s = ConfigList[k];
				let $input: VNode;
				const onUpdate = (e: InputEvent | FocusEvent) => {
					const target = e.target as HTMLInputElement;
					applyNewConfig(
						{
							[k]: target.value
						} as never,
						e.type === "blur"
					);
				};
				if (s.type === "input") {
					$input = (
						<input name={k} value={current[k]} onBlur={onUpdate}></input>
					);
				} else if (s.type === "switch") {
					$input = (
						<input
							name={k}
							type="checkbox"
							value={current[k]}
							onInput={onUpdate}
						></input>
					);
				} else if (s.type === "select") {
					$input = (
						<select name={k} value={current[k]} onInput={onUpdate}>
							{s.options?.map(opt => (
								<option value={opt.value}>{opt.text ?? opt.value}</option>
							))}
						</select>
					);
				} else {
					console.warn("Invalid config item type:", s.type);
					$input = <input name={k} value={current[k]}></input>;
				}
				return (
					<div class={style.sourceConfigItem}>
						<div>
							<div>{s.title}</div>
							<div class={style.itemDescription}>{s.description}</div>
						</div>
						{$input}
					</div>
				);
			})}
		</form>
	);
};
