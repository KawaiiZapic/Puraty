import path from "tjs:path";

import { AppData } from "@/db/AppData";
import { createSubscriber } from "@/utils/subscriber";

import { configValidator, defaultValues, type AppConfig } from "./app.model";

const [onConfigReload, reloadConfig] = createSubscriber();

export { onConfigReload };

export class MainService {
	static async applyNewConfig(config: Record<string, unknown>) {
		const oldConfig = AppData.getAll();
		const ignoredKeys: string[] = [];
		for (const k in config) {
			const validator = configValidator[k as keyof AppConfig];
			if (typeof validator === "undefined" || validator(config[k])) {
				AppData.set(k, config[k]);
			} else {
				console.error(`Invalid value for ${k}: ${config[k]}`);
				ignoredKeys.push(k);
			}
		}
		await reloadConfig(oldConfig, AppData.getAll());
		return ignoredKeys;
	}

	static getConfig() {
		const result = {
			...defaultValues
		};
		const conf = AppData.getAll();
		Object.keys(result).forEach(k => {
			if (conf[k]) {
				// @ts-expect-error merging keys
				result[k] = conf[k];
			}
		});
		return result;
	}

	@onConfigReload
	static async reloadProxy(oldConf: AppConfig, newConf: AppConfig) {
		if (oldConf.httpProxy === newConf.httpProxy) return;
		if (newConf.httpProxy === "") {
			await tjs.remove(path.join(APP_DIR, "proxy.env"));
			return;
		}
		const f = await tjs.open(path.join(APP_DIR, "proxy.env"), "w");
		await f.write(
			new TextEncoder().encode(
				`export http_proxy=${newConf.httpProxy} https_proxy=${newConf.httpProxy}`
			)
		);
		await f.close();
	}
}
