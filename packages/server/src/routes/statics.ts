import { HTTPError, type H3 } from "h3";
import path from "tjs:path";

const assertBase = "./frontend";
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

export default (app: H3) => {
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
}