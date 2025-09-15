import { Controller, Get, Post } from "@/utils/decorator";
import { env } from "@/utils/env";
import { Convert } from "@/venera-lib";
import { HTTPError, type H3Event } from "h3";

export const ac = new AbortController();
const PURATY_VERSION = "0.1.0";

@Controller("")
export class CommandHandler {
  @Post("/command/exit")
  exit() {
    if (!env.DEV) {
      ac.abort();
    } else {
      throw new HTTPError("Exit command is ignore in dev mode", { status: 500 });
    }
  }

  @Post("/version")
  version() {
    return PURATY_VERSION;
  }

  @Get("/image/:url")
  async image(e: H3Event) {
    let url = e.context.params?.url;
    if (!url) {
      throw new HTTPError("Required params not found");
    }
    url = Convert.decodeUtf8(Convert.decodeBase64(url));
    return await fetch(url);
  }
}
