import { Controller, Post, Get } from "@/utils/decorators";
import { Convert } from "@/venera-lib";
import { type H3Event, HTTPError } from "h3";

const PURATY_VERSION = "0.1.0";

@Controller()
export class MiscController {
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