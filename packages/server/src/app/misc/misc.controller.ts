import { Controller, Post, Get, Path } from "@/utils/decorators";
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
  async image(@Path("url") _url: string) {
    const url = Convert.decodeUtf8(Convert.decodeBase64(_url));
    return await fetch(url);
  }
}