import { HTTPError, type H3Event } from "h3";

import {
	Controller,
	Delete,
	Get,
	Json,
	Patch,
	Path,
	Post,
	Query,
	ReqEvent,
	Required
} from "@/utils/decorators";

import { ComicSourceData, InstalledSource } from "./comic-source.db";
import type {
	InstallBody,
	UAPLoginBody,
	SourceModifyBody
} from "./comic-source.model";
import { ComicSourceService } from "./comic-source.service";

@Controller("/comic-source")
export class ComicSourceHandler {
	@Get("/available")
	available() {
		return ComicSourceService.available();
	}

	@Get("/installed")
	list(@Query("allowInitializeError") allowErr = "false") {
		return ComicSourceService.list(allowErr === "true");
	}

	@Post("/add")
	async add(@Required @Json body: InstallBody, @ReqEvent e: H3Event) {
		const v = await ComicSourceService.install(body.url, body.key);
		e.res.status = 201;
		return { key: body.key, version: v };
	}

	@Delete("/:id")
	async delete(@Path("id") id: string) {
		const list = InstalledSource.list();
		if (id in list) {
			await ComicSourceService.uninstall(id);
		} else {
			throw new HTTPError("Comic source not found: " + id, { status: 404 });
		}
	}

	@Get("/:id")
	get(@Path("id") id: string) {
		return ComicSourceService.getSourceDetail(id, true);
	}

	@Patch("/:id")
	async modify(@Path("id") id: string, @Json body?: SourceModifyBody) {
		if (!body?.settingValues) return;
		const source = await ComicSourceService.get(id);
		for (const k in source.settings) {
			if (k in body.settingValues) {
				ComicSourceData.set("setting", id, k, String(body.settingValues[k]));
			}
		}
	}

	@Post("/:id/callback/:callback")
	async execCallback(
		@Path("id") id: string,
		@Path("callback") callback: string
	) {
		const source = await ComicSourceService.get(id);
		const cb = source.settings?.[callback];
		if (!cb || cb.type !== "callback")
			throw HTTPError.status(404, undefined, {
				message: "callback " + callback + " not found in " + id
			});
		await cb.callback();
	}

	@Post("/:id/login")
	async doUAPLogin(
		@Path("id") id: string,
		@Required @Json loginBody: UAPLoginBody
	) {
		const s = await ComicSourceService.get(id);
		if (typeof s.account?.login !== "function")
			throw new HTTPError(
				id + " does not support login via username and password.",
				{ status: 400 }
			);
		try {
			const r = await s.account.login(loginBody.username, loginBody.password);
			if (typeof r === "undefined") {
				throw "Login failed.";
			}

			ComicSourceService.setLoginStatus(id, [
				loginBody.username,
				loginBody.password
			]);
		} catch (e) {
			console.error(e);
			throw new HTTPError({
				status: 400,
				message: String(e)
			});
		}
	}

	@Post("/:id/cookie-login")
	async doCookieLogin(
		@Path("id") id: string,
		@Required @Json loginBody: Record<string, string>
	) {
		const s = await ComicSourceService.get(id);
		if (typeof s.account?.loginWithCookies?.validate !== "function")
			throw new HTTPError(id + " does not support login via cookies.", {
				status: 400
			});
		const fields = s.account.loginWithCookies.fields;
		try {
			const f = fields.map(f => loginBody[f] ?? "");
			const r = await s.account.loginWithCookies.validate(f);
			if (!r) {
				throw "Login failed.";
			}
			ComicSourceService.setLoginStatus(id, ["", ""]);
		} catch (e) {
			console.error(e);
			throw new HTTPError({
				status: 400,
				message: String(e)
			});
		}
	}

	@Post("/:id/logout")
	async logout(@Path("id") id: string) {
		const s = await ComicSourceService.get(id);
		s.account?.logout?.();
		ComicSourceService.setLoginStatus(id);
	}
}
