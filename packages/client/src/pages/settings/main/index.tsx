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
	convert?: (v: string) => unknown;
}

export const keys = <T extends object>(obj: T): (keyof T)[] => {
	return Object.keys(obj) as (keyof T)[];
};
const ConfigList: Partial<Record<keyof AppConfig, ConfigItem>> = {
	httpProxy: {
		type: "input",
		title: "HTTP 代理",
		description: "代理地址，如 http://127.0.0.1:7890"
	},
	readerPreloadPages: {
		type: "select",
		convert: (v: string) => parseInt(v),
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
	},
	debugEnableSlowRendering: {
		type: "switch",
		title: "模拟墨水屏设备渲染",
		description: "启用后渲染将会被推迟300毫秒（需要重启）"
	},
	debugEnableChromiumRemoteDebug: {
		type: "switch",
		title: "Chromium 远程调试",
		description:
			"启用后将会在 127.0.0.1:19522 启动Chromium的远程调试（需要重启）"
	}
};
const MainSettingsPage = () => {
	const modal = useModal();
	const current = getConfig();

	const applyNewConfig = useCallback(
		(result: Partial<AppConfig>) => {
			api.App.modifyConfig(result as Record<string, unknown>).then(
				({ ignoredKeys }) => {
					if (ignoredKeys.length) {
						modal.alert(
							`${ignoredKeys.map(v => ConfigList[v as keyof AppConfig]?.title ?? v).join(", ")}的值无效`
						);
					}
					initConfig();
				}
			);
		},
		[modal]
	);

	return (
		<form>
			{keys(ConfigList).map(k => {
				const s = ConfigList[k];
				if (!s) return;
				const stringValue = String(current[k]);
				let $input: VNode;
				const onUpdate = (e: InputEvent | FocusEvent) => {
					const target = e.target as HTMLInputElement;
					const newValue =
						target.type === "checkbox"
							? target.checked
							: (s.convert?.(target.value) ?? target.value);
					applyNewConfig({ [k]: newValue });
				};
				if (s.type === "input") {
					$input = (
						<input name={k} value={stringValue} onBlur={onUpdate}></input>
					);
				} else if (s.type === "switch") {
					$input = (
						<input
							name={k}
							type="checkbox"
							checked={stringValue === "true"}
							onInput={onUpdate}
						></input>
					);
				} else if (s.type === "select") {
					$input = (
						<select name={k} value={stringValue} onInput={onUpdate}>
							{s.options?.map(opt => (
								<option value={opt.value} key={opt.value}>
									{opt.text ?? opt.value}
								</option>
							))}
						</select>
					);
				} else {
					console.warn("Invalid config item type:", s.type);
					$input = <input name={k} value={stringValue}></input>;
				}
				return (
					<div class={style.sourceConfigItem} key={k}>
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

export default MainSettingsPage;
