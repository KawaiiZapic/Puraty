import path from "tjs:path";

export default async () => {
  globalThis.APP_DIR = path.join(path.dirname(import.meta.url.substring(5)), "data");
  await tjs.makeDir(APP_DIR, {recursive: true});
}