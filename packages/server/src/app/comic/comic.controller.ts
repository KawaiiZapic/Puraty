import { ComicSourceService } from "@/app/comic-source/comic-source.service";
import { Controller, Get, Path, Query, Required } from "@/utils/decorators";
import { HTTPError } from "h3";
import type { ExplorePageResult } from "./comic.model";
import type { ComicDetails } from "@/venera-lib";
import { ComicService } from "./comic.service";
import path from "tjs:path";


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

  @Get("/:id/manga/:comicId/:chapter")
  async pages(
    @Path("id") id: string,
    @Path("comicId") comicId: string,
    @Path("chapter") chapter: string
  ){
    const source = await ComicSourceService.get(id);
    try {
      return {
        ...await source.comic.loadEp(decodeURIComponent(comicId), chapter),
        hasImageLoadHook: !!source.comic.onImageLoad
      };
    } catch (e) {
      console.error(e);
      throw new HTTPError("Comic source failed to load data: " + e, { status: 500 });
    }
  }

  @Get("/image")
  async image(
    @Required @Query("source") source: string,
    @Query("comicId") comicId: string,
    @Query("epId") epId: string,
    @Required @Query("image") image: string
  ) {
    const f = await ComicService.getImageCache(source, image, comicId, epId);
    if (!f) {
      const res = await fetch(image);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const ubuffer = new Uint8Array(buffer);
        await ComicService.saveImageCache(ubuffer, source, image, comicId, epId);
        return new Response(buffer, {
          status: 200,
          headers: {
            "content-type": res.headers.get("content-type") ?? "",
            "content-length": res.headers.get("content-length") ?? ""
          }
        });
      } else {
        throw new HTTPError("Failed to load image, image url return a not ok status", { status: 500 });
      }
    } else {
      const resp = new Response(f.readable, {
        status: 200,
        headers: {
          "content-type": "image/" + path.extname(f.path).substring(1),
          "content-length": (await f.stat()).size.toString()
        }
      });
      return resp;
    }
  }
}
