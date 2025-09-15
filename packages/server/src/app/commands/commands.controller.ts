import { Controller, Get, Post } from "@/utils/decorators";
import { env } from "@/utils/env";
import { HTTPError } from "h3";

export const ac = new AbortController();

@Controller("/command")
export class CommandHandler {
  @Post("/exit")
  exit() {
    if (!env.DEV) {
      ac.abort();
    } else {
      throw new HTTPError("Exit command is ignore in dev mode", { status: 500 });
    }
  }
}
