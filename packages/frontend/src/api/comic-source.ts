import { Req } from ".";
import type { ComicSourceHandler } from "@puraty/server";

export const ComicSource = {
  available() {
    return Req.get("/api/comic-source/available");
  },
  list() {
    return Req.get("/api/comic-source/installed");
  },
  add(url: string, key: string) {
    return Req.post("/api/comic-source/add", JSON.stringify({
      url,
      key
    }));
  },
  delete(id: string){
    return Req.delete(`/api/comic-source/${id}`);
  },
  get(id: string) {
    return Req.get(`/api/comic-source/${id}`);
  },
  explore(id: string, page: string) {
    return Req.get(`/api/comic-source/${id}/explore/${page}`);
  }
} satisfies ComicSourceHandler;

