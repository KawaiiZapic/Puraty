import { ComicSourceData, InstalledSource } from "@/app/comic-source/comic-source.db";
import type { ComicSource } from "@/venera-lib";
import path from "tjs:path";
import type { InstalledSourceDetail, NetworkSourceDetail } from "./comic-source.model";
import type { AnySettingItem } from "@/venera-lib/Source";

const IMPORT_TEMPLATE = `import { 
  APP, Cookie, Comic, ComicDetails, 
  ComicSource, Comment, Convert, HtmlDocument, 
  HtmlElement, HtmlNode, Image, ImageLoadingConfig, 
  Network, _Timer, console, createUuid, randomDouble, 
  randomInt, setInterval, setTimeout 
} from "${path.dirname(new URL(import.meta.url).pathname)}/venera-lib/index.js";

`;

export class ComicSourceService {
  static _instances: Record<string, ComicSource> = {};

  static async get(id: string, allowInitializeError = false) {
    if (ComicSourceService._instances[id]) {
      if (ComicSourceService._instances[id].initializeError && !allowInitializeError) {
        throw new Error("Failed to initialize source " + id + ": " +ComicSourceService._instances[id].initializeError);
      }
      return ComicSourceService._instances[id];
    }
    if (!(id in InstalledSource.list())) {
      throw new Error("Source not found: " + id);
    }
    let dir = "";
    try {
      dir = await tjs.makeTempDir("/tmp/source-XXXXXXXX");
      await tjs.copyFile(path.join(APP_DIR, `comic-source/${id}.js`), path.join(dir, `${id}.js`));
      const source = (await import(path.join(dir, `${id}.js`))).default;
      const s: ComicSource = new source();
      ComicSourceService._instances[id] = s;
      try {
        await s.init?.();
      } catch(e) {
        s.initializeError = String(e) + (e instanceof Error ? `\n${e.stack}` : "");
        if (!allowInitializeError) {
          throw e;
        }
      }
      return s;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error("Failed to initialize source " + id + ": " + e.message + "\n" + e.stack);
      }
      throw new Error("Failed to initialize source " + id + ": " + e);
    } finally {
      if (dir) {
        await tjs.remove(dir);
      }
    }
  }

  static async install(url: string, key: string) {
    try {
      let source = await (await fetch("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/" + url)).text();
      source = IMPORT_TEMPLATE + source.replace(/class .*? extends ComicSource/gi, v => `export default ${v}`);
      await tjs.makeDir(path.join(APP_DIR, "comic-source"), { recursive: true });
      const f = await tjs.open(path.join(APP_DIR, `comic-source/${key}.js`), "w");
      await f.write(new TextEncoder().encode(source));
      await f.close();
      const v = await import(path.join(APP_DIR, `comic-source/${key}.js`)).then(({ default: source }) => {
        const s: ComicSource = new source();
        return s.version;
      });
      InstalledSource.install(key, v);
      delete ComicSourceService._instances[key];
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

  static async list(allowInitializeError = false) {
    const list = InstalledSource.list();
    const result: InstalledSourceDetail[] = [];
    for (const name in list) {
      try {
        result.push(await this.getSourceDetail(name, allowInitializeError));
      } catch (e) {
        console.error(e);
      }
    }
    return result;
  }

  static async available() {
    const data = await(await fetch("https://cdn.jsdelivr.net/gh/venera-app/venera-configs@latest/index.json")).text();
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

  static async getSourceDetail(id: string, allowInitializeError = false) {
    const source = await ComicSourceService.get(id, allowInitializeError);
    const settingValues = ComicSourceService.getSettings(id);
    const translatedSettings: Record<string, AnySettingItem> = {};
    
    for (const key in source.settings) {
      const r = {
        ...source.settings[key]
      };
      r.title = source.translate(r.title);
      if (r.type === "select" && r.options) {
        r.options = r.options.map(opt => {
          return {
            text: opt.text && source.translate(opt.text),
            value: opt.value
          }
        })
      }
      if (r.type === "callback") {
        r.buttonText = source.translate(r.buttonText);
      }
      translatedSettings[key] = r;
    }
    return {
      name: source.name,
      key: source.key,
      version: source.version,
      explore: source.explore?.map((v, id) => ({
        id,
        title: source.translate(v.title),
        type: v.type
      })),
      settings: translatedSettings,
      settingValues: settingValues,
      isLogged: source.isLogged,
      features: {
        UAPLogin: typeof source.account?.login === "function",
        CookieLogin: source.account?.loginWithCookies?.fields,
        logout: typeof source.account?.logout === "function",
      },
      initializedError: source.initializeError
    } satisfies InstalledSourceDetail;
  }
}