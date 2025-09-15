import { AppData } from "@/db/AppData";
import { ComicSourceManager } from "@/handler/ComicSourceManager";
import { Controller, Delete, Get, Post } from "@/utils/decorator";
import type { Comic, ComicSource } from "@/venera-lib";
import { HTTPError, type H3, type H3Event } from "h3";

interface SourceDetail {
  name: string;
  fileName: string;
  key: string;
  version: string;
  description?: string;
}

interface InstallBody {
  url: string;
  key: string;
}

interface InstalledSourceDetail {
  name: string;
  explore?: {
    id: number;
    title: string;
    type: Required<ComicSource>["explore"][number]["type"];
  }[];
}

@Controller("/comic-source")
export class ComicSourceHandler {

  @Get("/available")
  async available() {
    let data = AppData.instance.get("comic-source-cache");
    if (!data) {
      data = new TextDecoder().decode(await (await fetch("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/index.json")).arrayBuffer());
    }
    let list: SourceDetail[] | null = null;
    try {
      list = JSON.parse(data);
    } catch(_) {}
    if (!list) throw new HTTPError("Failed to load comic source list", { status: 500 });
    return list;
  }

  @Get("/installed")
  InstalledSource() {
    return ComicSourceManager.list();
  }

  @Post("/add")
  async add(e: H3Event) {
    const b = await e.req.json() as InstallBody;
    const v = await ComicSourceManager.install("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/" + b.url, b.key);
    e.res.status = 201;
    return { key: b.key, version: v };
  }

  @Delete("/:id")
  async delete(e: H3Event) {
    const list = ComicSourceManager.list();
    const id = e.context.params?.id;
    if (id && id in list) {
      await ComicSourceManager.uninstall(id);
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  }

  @Get("/:id")
  async detail(e: H3Event) {
    const id = e.context.params?.id;
    if (id) {
      const source = await ComicSourceManager.get(id);
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
      const source = await ComicSourceManager.get(id);
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
        console.error(_);
        throw new HTTPError("Comic source failed to load data: " + _, { status: 500 });
      }
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  }
}
