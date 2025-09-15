import { ComicSourceService } from "./comic-source.service";
import { Controller, Delete, Get, Post } from "@/utils/decorators";
import type { Comic } from "@/venera-lib";
import { HTTPError, type H3Event } from "h3";
import type { InstallBody, InstalledSourceDetail } from "./comic-source.model";


@Controller("/comic-source")
export class ComicSourceHandler {

  @Get("/available")
  available() {
    try {
      return ComicSourceService.available();
    } catch (_) {
      throw new HTTPError("Failed to load comic source list", { status: 500 });
    }
  }

  @Get("/installed")
  list() {
    return ComicSourceService.list();
  }

  @Post("/add")
  async add(e: H3Event) {
    const b = await e.req.json() as InstallBody;
    const v = await ComicSourceService.install(b.url, b.key);
    e.res.status = 201;
    return { key: b.key, version: v };
  }

  @Delete("/:id")
  async delete(e: H3Event) {
    const list = ComicSourceService.list();
    const id = e.context.params?.id;
    if (id && id in list) {
      await ComicSourceService.uninstall(id);
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  }

  @Get("/:id")
  async get(e: H3Event) {
    const id = e.context.params?.id;
    if (id) {
      const source = await ComicSourceService.get(id);
      return {
        name: source.name,
        explore: source.explore?.map((v, id) => ({
          id,
          title: v.title,
          type: v.type
        }))
      } satisfies InstalledSourceDetail;
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  }

  @Get("/:id/explore/:explore")
  async explore(e: H3Event){
    const id = e.context.params?.id;
    const explore = parseInt(e.context.params?.explore ?? "");
    if (id) {
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
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  }
}
