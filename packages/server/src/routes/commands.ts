import { env } from "@/utils/env";
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
}