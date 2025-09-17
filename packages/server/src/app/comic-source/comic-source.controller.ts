import { ComicSourceService } from "./comic-source.service";
import { Controller, Delete, Get, Json, Patch, Path, Post, ReqEvent, Required } from "@/utils/decorators";
import type { Comic } from "@/venera-lib";
import { HTTPError, type H3Event } from "h3";
import type { InstallBody, InstalledSourceDetail, SourceModifyBody } from "./comic-source.model";
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
      settingValues: settings
    } satisfies InstalledSourceDetail;
  }

  @Patch("/:id")
  async modify(
    @Path("id") id: string,
    @Json body: SourceModifyBody
  ) {
    if (!body.settingValues) return;
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
        data = await explorePage.load(1);
      }
      return data;
    } catch (_) {
      throw new HTTPError("Comic source failed to load data: " + _, { status: 500 });
    }
  }
}
