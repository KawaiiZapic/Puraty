import CryptoJS from "crypto-js";
import path from "tjs:path";

const getExt = (url: string) => {
  try {
    return path.extname(url);
  } catch (_) {
    return "";
  }
}
export class ComicService {
  static async getImageCache(source: string, url: string, comicId?: string, chapter?: string) {
    const hash = CryptoJS.SHA1(`${source}_${comicId ?? ""}_${chapter ?? ""}_${url}`).toString(CryptoJS.enc.Hex);
    const h2 = hash.substring(0, 2);
    const file = path.join(APP_DIR, "cache", h2, hash + getExt(url));
    try {
      return await tjs.open(file, "r");
    } catch (_) {
      return;
    }
  }

  static async saveImageCache(data: Uint8Array, source: string, url: string, comicId?: string, chapter?: string) {
    const ext = path.extname(url);
    const hash = CryptoJS.SHA1(`${source}_${comicId ?? ""}_${chapter ?? ""}_${url}`).toString(CryptoJS.enc.Hex);
    const h2 = hash.substring(0, 2);
    const file = path.join(APP_DIR, "cache", h2, hash + getExt(url));
    await tjs.makeDir(path.dirname(file), { recursive: true });
    const f= await tjs.open(file, "w");
    await f.write(data);
    f.close();
  }
}