import { H3, HTTPError } from "h3";
import { serve } from "h3-txikijs-adapter";
import initialize from "./utils/initialize";
import { startBrowser } from "./utils/process";
import path from "tjs:path";

await initialize();

const PURATY_VERSION = "0.1.0";
const app = new H3();
const ac = new AbortController();
const assertBase = "/mnt/us/extensions/Puraty/frontend"

const serveStatic = async (fp: string) => {
  const p = path.join(assertBase, fp);
  try {
    const f = await tjs.open(p, "r");
    return f.readable;
  } catch (e) {
    throw new HTTPError("File not found", {
      status: 404
    });
  }
}

app.get("/", async (e) => {
  e.res.headers.set("content-type", "text/html");
  return await serveStatic("index.html");
});

app.get("/assets/**", (e) => {
  const f = e.context.params!._;
  if (f.endsWith(".css")) {
    e.res.headers.set("content-type", "text/css");
  } else if (f.endsWith(".js")) {
    e.res.headers.set("content-type", "text/javascript");
  } else {
    e.res.headers.set("content-type", "application/octet-stream");
  }
  return serveStatic("/assets/" + e.context.params!._);
});

app.post("/command/exit", () => {
  ac.abort();
});

serve(app, {
  signal: ac.signal
});

startBrowser(ac.signal);