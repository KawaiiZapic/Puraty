import { AppData } from "@/db/AppData";
import { ComicSourceManager } from "@/handler/ComicSourceManager";
import { HTTPError, type H3 } from "h3";

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

export default (app: H3) => {
  app.get("/api/comic-source/available", async (e) => {
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
  });

  app.get("/api/comic-source/installed", async (e) => {
    return ComicSourceManager.list();
  });
  
  app.post("/api/comic-source/add", async (e) => {
    const b = await e.req.json() as InstallBody;
    const v = await ComicSourceManager.install("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/" + b.url, b.key);
    e.res.status = 201;
    return { key: b.key, version: v };
  });

  app.delete("/api/comic-source/:id", async (e) => {
    const list = ComicSourceManager.list();
    const id = e.context.params?.id;
    if (id && id in list) {
      await ComicSourceManager.uninstall(id);
    } else {
      throw new HTTPError("Comic source not found: " + id, { status: 404 });
    }
  });
};