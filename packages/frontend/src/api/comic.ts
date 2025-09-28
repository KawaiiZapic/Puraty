import { Req } from ".";
import type { ComicHandler } from "@puraty/server";

export const Comic = {
  explore(id: string, page: string) {
    return Req.get(`/api/comic/${id}/explore/${page}`);
  }
} satisfies ComicHandler;

