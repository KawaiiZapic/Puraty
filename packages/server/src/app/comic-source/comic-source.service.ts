import { ComicSourceData, InstalledSource } from "@/app/comic-source/comic-source.db";
import { env } from "@/utils/env";
import type { ComicSource } from "@/venera-lib";
import path from "tjs:path";
import type { NetworkSourceDetail } from "./comic-source.model";

const IMPORT_TEMPLATE = `import { 
  APP, Cookie, Comic, ComicDetails, 
  ComicSource, Comment, Convert, HtmlDocument, 
  HtmlElement, HtmlNode, Image, ImageLoadingConfig, 
  Network, _Timer, console, createUuid, randomDouble, 
  randomInt, setInterval, setTimeout 
} from "../../${env.DEV ? "dist" : "server"}/venera-lib/index.js";

`;

export class ComicSourceService {
  static _instances: Record<string, ComicSource> = {};

  static async get(id: string) {
    if (ComicSourceService._instances[id]) {
      return ComicSourceService._instances[id];
    }
    if (!(id in InstalledSource.list())) {
      throw new Error("Source not found: " + id);
    }
    return await import(path.join(APP_DIR, `comic-source/${id}.js`)).then(({ default: source }) => {
      const s: ComicSource = new source();
      ComicSourceService._instances[id] = s;
      return s;
    });
  }

  static async install(url: string, key: string) {
    try {
      let source = IMPORT_TEMPLATE + new TextDecoder().decode(await (await fetch("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/" + url)).arrayBuffer());
      source = source.replace(/class .*? extends ComicSource/gi, v => `export default ${v}`);
      await tjs.makeDir(path.join(APP_DIR, "comic-source"), { recursive: true });
      const f = await tjs.open(path.join(APP_DIR, `comic-source/${key}.js`), "w");
      await f.write(new TextEncoder().encode(source));
      await f.close();
      const v = await import(path.join(APP_DIR, `comic-source/${key}.js`)).then(({ default: source }) => {
        const s: ComicSource = new source();
        return s.version;
      });
      InstalledSource.install(key, v)
      return v;
    } catch (e) {
      try {
        await tjs.remove(path.join(APP_DIR, `comic-source/${key}.js`));
      } finally { }
      throw e;
    }
  }

  static async uninstall(id: string) {
    if (!(id in InstalledSource.list())) {
      throw new Error("Source not found: " + id);
    }
    try {
      await tjs.remove(path.join(APP_DIR, `comic-source/${id}.js`));
    } finally { }
    InstalledSource.delete(id);
    delete ComicSourceService._instances[id];
  }

  static list() {
    return InstalledSource.list();
  }

  static async available() {
    const data = new TextDecoder().decode(await(await fetch("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/index.json")).arrayBuffer());
    return JSON.parse(data) as NetworkSourceDetail[];
  }

  static getSettings(id: string) {
    const r: Record<string, string> = {};
    const keyLength = `setting_${id}_`.length;
    ComicSourceData.getAll("setting", id).forEach(v => {
      r[v.key.substring(keyLength)] = v.value;
    });
    return r;
  }

  static setLoginStatus(id: string, isLogged: boolean) {
    if (isLogged) {
      ComicSourceData.set("setting", id, "__system_logged", "true");
    } else {
      ComicSourceData.delete("setting", id, "__system_logged");
    }
  }
}