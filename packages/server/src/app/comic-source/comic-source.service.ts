import semver from "semver";
import path from "tjs:path";

import {
	ComicSourceData,
	InstalledSource
} from "@/app/comic-source/comic-source.db";
import {
	LoginFailedError,
	NetworkRequestError,
	NotSupportedError,
	SourceInitializeError,
	SourceInstallError,
	SourceNotFoundError
} from "@/utils/error";
import { createLogger } from "@/utils/logger";
import type { ComicSource } from "@/venera-lib";
import * as VeneraLib from "@/venera-lib";
import { getMeta, type AnySettingItem } from "@/venera-lib/Source";

import {
	type BasicLoginBody,
	type InstalledSourceDetail,
	type NetworkSourceDetail
} from "./comic-source.model";

const IMPORT_TEMPLATE = `import { ${Object.keys(VeneraLib).join(", ")} } from "${path.dirname(new URL(import.meta.url).pathname)}/venera-lib/index.js";

`;

export class ComicSourceService {
	static _instances: Record<string, ComicSource> = {};
	static logger = createLogger("ComicSourceService");

	static async initSource(source: ComicSource, ignoreInitializeError = false) {
		const meta = getMeta(source);
		if (meta.hasInitialized) {
			return;
		}
		try {
			await source.init?.();
			meta.hasInitialized = true;
		} catch (e) {
			meta.initializeError =
				String(e) + (e instanceof Error ? `\n${e.stack}` : "");
			if (!ignoreInitializeError) {
				throw new SourceInitializeError(source.key, meta.initializeError);
			}
		}
	}

	static async get(id: string, ignoreInitializeError = false, init = true) {
		if (ComicSourceService._instances[id]) {
			const s = ComicSourceService._instances[id];
			const meta = getMeta(s);
			if (meta.initializeError && !ignoreInitializeError) {
				throw new SourceInitializeError(id, meta.initializeError);
			}
			if (init) {
				await this.initSource(s, ignoreInitializeError);
			}
			return ComicSourceService._instances[id];
		}
		if (!(id in InstalledSource.list())) {
			throw new SourceNotFoundError(id);
		}
		let dir = "";
		try {
			dir = await tjs.makeTempDir("/tmp/source-XXXXXXXX");
			await tjs.copyFile(
				path.join(APP_DIR, `comic-source/${id}.js`),
				path.join(dir, `${id}.js`)
			);
			const source = (await import(path.join(dir, `${id}.js`))).default;
			const s: ComicSource = new source();
			if (typeof s.settings === "object") {
				s.settings = new Proxy(s.settings, {
					get(target, key) {
						return target[key as never];
					},
					set() {
						return true;
					}
				});
			}
			if (init) {
				await this.initSource(s, ignoreInitializeError);
			}
			ComicSourceService._instances[id] = s;
			return s;
		} catch (e) {
			if (e instanceof Error) {
				throw new SourceInitializeError(id, e.message + "\n" + e.stack);
			}
			throw new SourceInitializeError(id, String(e));
		} finally {
			if (dir) {
				await tjs.remove(dir);
			}
		}
	}

	static async install(url: string, key: string) {
		let source: string;
		try {
			source = await (
				await fetch(
					"https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/" + url
				)
			).text();
		} catch (e) {
			throw new NetworkRequestError(url, e);
		}
		try {
			source =
				IMPORT_TEMPLATE +
				source.replace(
					/class .*? extends ComicSource/gi,
					v => `export default ${v}`
				);
			await tjs.makeDir(path.join(APP_DIR, "comic-source"), {
				recursive: true
			});
			const f = await tjs.open(
				path.join(APP_DIR, `comic-source/${key}.js`),
				"w"
			);
			await f.write(new TextEncoder().encode(source));
			await f.close();
			const v = await import(path.join(APP_DIR, `comic-source/${key}.js`)).then(
				({ default: source }) => {
					const s: ComicSource = new source();
					return s.version;
				}
			);
			InstalledSource.install(key, v);
			delete ComicSourceService._instances[key];
		} catch (e) {
			throw new SourceInstallError(key, String(e));
		}
	}

	static async uninstall(id: string) {
		if (!(id in InstalledSource.list())) {
			throw new SourceNotFoundError(id);
		}
		try {
			await tjs.remove(path.join(APP_DIR, `comic-source/${id}.js`));
		} catch {}
		InstalledSource.delete(id);
		delete ComicSourceService._instances[id];
	}

	static async list(allowInitializeError = false) {
		const list = InstalledSource.list();
		const result: InstalledSourceDetail[] = [];
		for (const name in list) {
			try {
				result.push(await this.getSourceDetail(name, allowInitializeError));
			} catch (e) {
				this.logger.error(e);
			}
		}
		return result;
	}

	static async available() {
		const data = await (
			await fetch(
				"https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/index.json"
			)
		).text();
		return JSON.parse(data) as NetworkSourceDetail[];
	}

	static getSettings(id: string) {
		return ComicSourceData.getAll("setting", id);
	}

	static async basicLogin(id: string, loginBody: BasicLoginBody) {
		const s = await ComicSourceService.get(id);
		if (typeof s.account?.login !== "function")
			throw new NotSupportedError(
				id + " does not support login with username and password."
			);
		try {
			const r = await s.account.login(loginBody.username, loginBody.password);
			if (typeof r === "undefined") {
				throw "Unknown reason";
			}

			ComicSourceService.setLoginStatus(id, [
				loginBody.username,
				loginBody.password
			]);
		} catch (e) {
			this.logger.error(e);
			throw new LoginFailedError(String(e));
		}
	}

	static async cookieLogin(id: string, loginBody: Record<string, string>) {
		const s = await ComicSourceService.get(id);
		if (typeof s.account?.loginWithCookies?.validate !== "function")
			throw new NotSupportedError(id + " does not support login with cookies.");
		const fields = s.account.loginWithCookies.fields;
		try {
			const f = fields.map(f => loginBody[f] ?? "");
			const r = await s.account.loginWithCookies.validate(f);
			if (!r) {
				throw "Invalid cookies.";
			}
			ComicSourceService.setLoginStatus(id, ["", ""]);
		} catch (e) {
			this.logger.error(e);
			throw new LoginFailedError(String(e));
		}
	}

	static setLoginStatus(id: string, account?: [string, string]) {
		if (account) {
			ComicSourceData.set("data", id, "account", account);
		} else {
			ComicSourceData.delete("data", id, "account");
		}
	}

	static async getSourceDetail(id: string, allowInitializeError = false) {
		const source = await ComicSourceService.get(
			id,
			allowInitializeError,
			false
		);
		const settingValues = ComicSourceService.getSettings(id);
		const translatedSettings: Record<string, AnySettingItem> = {};

		for (const key in source.settings) {
			const r = {
				...source.settings[key]
			};
			r.title = source.translate(r.title);
			if (r.type === "select" && r.options) {
				r.options = r.options.map(opt => {
					return {
						text: opt.text && source.translate(opt.text),
						value: opt.value
					};
				});
			}
			if (r.type === "callback") {
				r.buttonText = source.translate(r.buttonText);
			}
			translatedSettings[key] = r;
		}
		const meta = getMeta(source);
		return {
			name: source.name,
			key: source.key,
			version: source.version,
			explore: source.explore?.map((v, id) => ({
				id,
				title: source.translate(v.title),
				type: v.type
			})),
			settings: translatedSettings,
			settingValues: settingValues,
			isLogged: source.isLogged,
			features: {
				UAPLogin: typeof source.account?.login === "function",
				CookieLogin: source.account?.loginWithCookies?.fields,
				logout: typeof source.account?.logout === "function",
				search: typeof source.search?.load === "function",
				idMatch: source.comic.idMatch
			},
			initializedError: meta.initializeError,
			incompatible: semver.gt(source.minAppVersion, VeneraLib.CompatibleVersion)
		} satisfies InstalledSourceDetail;
	}
}
