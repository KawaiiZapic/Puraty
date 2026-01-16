import { HTTPError } from "h3";

import {
	Bool,
	Controller,
	Delete,
	Get,
	getCurrentEvent,
	Json,
	NotRequired,
	Patch,
	Path,
	Post,
	Query
} from "@/utils/decorators";

import { ComicSourceData } from "./comic-source.db";
import type {
	InstallBody,
	BasicLoginBody,
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
	list(@Bool @NotRequired @Query("allowInitializeError") allowErr = false) {
		return ComicSourceService.list(allowErr);
	}

	@Post("/add")
	async add(@Json body: InstallBody) {
		const e = getCurrentEvent();
		const v = await ComicSourceService.install(body.url, body.key);
		e.res.status = 201;
		return { key: body.key, version: v };
	}

	@Delete("/:id")
	async delete(@Path("id") id: string) {
		await ComicSourceService.uninstall(id);
	}

	@Get("/:id")
	get(@Path("id") id: string) {
		return ComicSourceService.getSourceDetail(id, true);
	}

	@Patch("/:id")
	async modify(@Path("id") id: string, @Json body: SourceModifyBody) {
		if (!body.settingValues) return;
		const source = await ComicSourceService.get(id);
		for (const k in source.settings) {
			if (k in body.settingValues) {
				ComicSourceData.set("setting", id, k, body.settingValues[k]);
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
	async basicLogin(@Path("id") id: string, @Json loginBody: BasicLoginBody) {
		return ComicSourceService.basicLogin(id, loginBody);
	}

	@Post("/:id/cookie-login")
	async cookieLogin(
		@Path("id") id: string,
		@Json loginBody: Record<string, string>
	) {
		return ComicSourceService.cookieLogin(id, loginBody);
	}

	@Post("/:id/logout")
	async logout(@Path("id") id: string) {
		const s = await ComicSourceService.get(id);
		s.account?.logout?.();
		ComicSourceService.setLoginStatus(id);
	}
}
