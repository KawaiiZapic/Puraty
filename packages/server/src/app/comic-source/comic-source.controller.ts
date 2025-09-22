import { ComicSourceService } from "./comic-source.service";
import { Controller, Delete, Get, Json, Patch, Path, Post, ReqEvent, Required } from "@/utils/decorators";
import { HTTPError, type H3Event } from "h3";
import type { InstallBody, InstalledSourceDetail, UAPLoginBody, SourceModifyBody, ExplorePageResult } from "./comic-source.model";
import { ComicSourceData } from "./comic-source.db";


@Controller("/comic-source")
export class ComicSourceHandler {

  @Get("/available")
  available() {
    return ComicSourceService.available();
  }

  @Get("/installed")
  list() {
    return ComicSourceService.list();
  }

  @Post("/add")
  async add(
    @Required @Json body: InstallBody, 
    @ReqEvent e: H3Event
  ) {
    const v = await ComicSourceService.install(body.url, body.key);
    e.res.status = 201;
    return { key: body.key, version: v };
  }

  @Delete("/:id")
  async delete(
    @Path("id") id: string
  ) {
    const list = ComicSourceService.list();
    if (id in list) {
      await ComicSourceService.uninstall(id);
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  }

  @Get("/:id")
  async get(
    @Path("id") id: string
  ) {
    const source = await ComicSourceService.get(id);
    const settings = ComicSourceService.getSettings(id);
    
    return {
      name: source.name,
      explore: source.explore?.map((v, id) => ({
        id,
        title: v.title,
        type: v.type
      })),
      settings: source.settings,
      settingValues: settings,
      isLogged: source.isLogged,
      features: {
        UAPLogin: typeof source.account?.login === "function",
        CookieLogin: source.account?.loginWithCookies?.fields,
        logout: typeof source.account?.logout === "function",
      }
    } satisfies InstalledSourceDetail;
  }

  @Patch("/:id")
  async modify(
    @Path("id") id: string,
    @Json body?: SourceModifyBody
  ) {
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
    @Path("callback") callback: string,
  ) {
    const source = await ComicSourceService.get(id);
    const cb = source.settings?.[callback];
    if (!cb || cb.type !== "callback") throw HTTPError.status(404, undefined, { message: "callback " + callback + " not found in " + id });
    await cb.callback();
  }

  @Post("/:id/login")
  async doUAPLogin(
    @Path("id") id: string,
    @Required @Json loginBody: UAPLoginBody
  ) {
    const s = await ComicSourceService.get(id);
    if (typeof s.account?.login !== "function") throw new HTTPError(id + " does not support login via username and password.", { status: 400 });
    try {
      const r= await s.account.login(loginBody.username, loginBody.password);
      if (typeof (r) === "undefined") {
        throw "Login failed.";
      }
      ComicSourceService.setLoginStatus(id, true);
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
    if (typeof s.account?.loginWithCookies?.validate !== "function") throw new HTTPError(id + " does not support login via cookies.", { status: 400 });
    const fields = s.account.loginWithCookies.fields;
    try {
      const f = fields.map(f => loginBody[f] ?? "");
      const r= await s.account.loginWithCookies.validate(f);
      if (!r) {
        throw "Login failed.";
      }
      ComicSourceService.setLoginStatus(id, true);
    } catch (e) {
      console.error(e);
      throw new HTTPError({
        status: 400,
        message: String(e)
      });
    }
  }

  @Post("/:id/logout")
  async logout(
    @Path("id") id: string,
    @Required @Json loginBody: Record<string, string>
  ) {
    const s = await ComicSourceService.get(id);
    s.account?.logout?.();
    ComicSourceService.setLoginStatus(id, false);
  }

  @Get("/:id/explore/:explore")
  async explore(
    @Path("id") id: string,
    @Path("explore") _explore: string
  ){
    const explore = parseInt(_explore);
    const source = await ComicSourceService.get(id);
    const explorePage = source.explore?.[explore];
    if (!explorePage) {
      throw new HTTPError("Comic source explore page not found: " + id + ":" + explore, { status: 404 });
    }
    try {
      let data;
      if (explorePage.type === "multiPageComicList") {
        data = await (explorePage.loadNext ? (explorePage).loadNext(null) : explorePage.load(1));
      } else {
        data = await explorePage.load(null);
      }
      return {
        data,
        type: explorePage.type
      } as ExplorePageResult;
    } catch (e) {
      console.error(e);
      throw new HTTPError("Comic source failed to load data: " + e, { status: 500 });
    }
  }
}
