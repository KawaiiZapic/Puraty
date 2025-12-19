import { shallowReactive, toRef, watch, type Ref } from "@puraty/reactivity";
import type { AppConfig } from "@puraty/server";

import api from "@/api";
import { Alert, Checkbox, Input, Select } from "@/components";

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

export default () => {
	const $ = <div></div>;
	const result = shallowReactive({}) as Record<string, string>;
	const ConfigList: Record<keyof AppConfig, ConfigItem> = {
		httpProxy: {
			type: "input",
			title: "HTTP 代理",
			description: "代理地址，如 http://127.0.0.1:7890"
		}
	};
	api.App.config().then(v => {
		for (const k of keys(ConfigList)) {
			const s = ConfigList[k];
			result[k] = String(v[k]);
			const $item = (
				<div class={style.sourceConfigItem}>
					<div>
						<div>{s.title}</div>
						<div class={style.itemDescription}>{s.description}</div>
					</div>
				</div>
			);
			if (s.type === "input") {
				const v = toRef(result, k);
				$item.appendChild(<Input name={k} modelValue={v}></Input>);
			} else if (s.type === "switch") {
				const v = toRef(result, k);
				$item.appendChild(
					<Checkbox name={k} type="checkbox" modelValue={v}></Checkbox>
				);
			} else if (s.type === "select") {
				const v = toRef(result, k) as Ref<string>;
				const $opts = s.options?.map(opt => {
					return <option value={opt.value}>{opt.text ?? opt.value}</option>;
				});
				const $select = (
					<Select name={k} modelValue={v}>
						{" "}
						{$opts}{" "}
					</Select>
				);
				$item.appendChild($select);
			}
			$.appendChild($item);
		}
		let timeout = 0;
		const applyNewConfig = (apply = false) => {
			if (!apply) {
				clearTimeout(timeout);
				timeout = setTimeout(() => applyNewConfig(true), 2000);
				return;
			}
			api.App.modifyConfig(result).then(({ ignoredKeys }) => {
				if (ignoredKeys.length) {
					Alert(
						`${ignoredKeys.map(v => ConfigList[v as keyof AppConfig]?.title ?? v).join(", ")}的值无效`
					);
				}
			});
		};
		watch(result, () => {
			applyNewConfig();
		});
	});

	return $;
};
