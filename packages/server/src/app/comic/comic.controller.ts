import { ComicSourceService } from "@/app/comic-source/comic-source.service";
import { Controller, Get, Path } from "@/utils/decorators";
import { HTTPError } from "h3";
import type { ExplorePageResult } from "./comic.model";
import type { ComicDetails } from "@/venera-lib";


@Controller("/comic")
export class ComicHandler {
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

  @Get("/:id/detail/:comicId")
  async detail(
    @Path("id") id: string,
    @Path("comicId") comicId: string
  ){
    const source = await ComicSourceService.get(id);
    try {
      return {
        ...await source.comic.loadInfo(decodeURIComponent(comicId))
      } as ComicDetails;
    } catch (e) {
      console.error(e);
      throw new HTTPError("Comic source failed to load data: " + e, { status: 500 });
    }
  }
}
