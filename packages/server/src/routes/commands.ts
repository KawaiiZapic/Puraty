import { env } from "@/utils/env";
import { Convert } from "@/venera-lib";
import { HTTPError, type H3 } from "h3";

export const ac = new AbortController();
const PURATY_VERSION = "0.1.0";

export default (app: H3) => {
  app.post("/api/command/exit", () => {
    if (!env.DEV) {
      ac.abort();
    } else {
      throw new HTTPError("Exit command is ignore in dev mode", { status: 500 });
    }
  });
  app.post("/api/version", () => PURATY_VERSION);
  app.get("/api/image/:url", async (e) => {
    let url = e.context.params?.url;
    if (!url) {
      throw new HTTPError("Required params not found");
    }
    url = Convert.decodeUtf8(Convert.decodeBase64(url));
    return await fetch(url);
  });
}