import { InstalledSource } from "@/db/InstalledSource";
import { env } from "@/utils/env";
import type { ComicSource } from "@/venera-lib";
import path from "tjs:path";

const IMPORT_TEMPLATE = `import { 
  APP, Cookie, Comic, ComicDetails, 
  ComicSource, Comment, Convert, HtmlDocument, 
  HtmlElement, HtmlNode, Image, ImageLoadingConfig, 
  Network, _Timer, console, createUuid, randomDouble, 
  randomInt, setInterval, setTimeout 
} from "../../${env.DEV ? "dist" : "server"}/venera-lib/index.js";

`;

export class ComicSourceManager {
  static _instances: Record<string, ComicSource> = {};

  static async get(id: string) {
    if (ComicSourceManager._instances[id]) {
      return ComicSourceManager._instances[id];
    }
    if (!(id in InstalledSource.instance.list())) {
      throw new Error("Source not found: " + id);
    }
    return await import(path.join(APP_DIR, `comic-source/${id}.js`)).then(({ default: source }) => {
      const s: ComicSource = new source();
      ComicSourceManager._instances[id] = s;
      return s;
    });
  }

  static async install(url: string, key: string) {
    try {
      let source = IMPORT_TEMPLATE + new TextDecoder().decode(await (await fetch(url)).arrayBuffer());
      source = source.replace(/class .*? extends ComicSource/gi, v => `export default ${v}`);
      await tjs.makeDir(path.join(APP_DIR, "comic-source"), { recursive: true });
      const f = await tjs.open(path.join(APP_DIR, `comic-source/${key}.js`), "w");
      await f.write(new TextEncoder().encode(source));
      await f.close();
      const v = await import(path.join(APP_DIR, `comic-source/${key}.js`)).then(({ default: source }) => {
        const s: ComicSource = new source();
        return s.version;
      });
      InstalledSource.instance.install(key, v)
      return v;
    } catch (e) {
      try {
        await tjs.remove(path.join(APP_DIR, `comic-source/${key}.js`));
      } finally {}
      throw e;
    }
  }

  static async uninstall(id: string) {
    if (!(id in InstalledSource.instance.list())) {
      throw new Error("Source not found: " + id);
    }
    try {
      await tjs.remove(path.join(APP_DIR, `comic-source/${id}.js`));
    } finally {}
    InstalledSource.instance.delete(id);
    delete ComicSourceManager._instances[id];
  }

  static list() {
    return InstalledSource.instance.list();
  }
}