import path from "tjs:path";

export default async (dataDir?: string) => {
  const dir = dataDir ?? path.join(path.dirname(import.meta.url.substring(5)), "..", "data");
  await tjs.makeDir(dir, {recursive: true});
  globalThis.APP_DIR = dir;
}