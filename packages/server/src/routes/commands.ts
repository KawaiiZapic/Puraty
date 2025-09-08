import type { H3 } from "h3";

export const ac = new AbortController();
const PURATY_VERSION = "0.1.0";

export default (app: H3) => {
  app.post("/command/exit", () => {
    ac.abort();
  });
  app.post("/version", () => PURATY_VERSION);
}