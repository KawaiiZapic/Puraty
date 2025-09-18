import { Req } from ".";
import type { ComicSourceHandler, SourceModifyBody } from "@puraty/server";

export const ComicSource = {
  available() {
    return Req.get("/api/comic-source/available");
  },
  list() {
    return Req.get("/api/comic-source/installed");
  },
  add(url: string, key: string) {
    return Req.post("/api/comic-source/add", {
      url,
      key
    });
  },
  delete(id: string){
    return Req.delete(`/api/comic-source/${id}`);
  },
  get(id: string) {
    return Req.get(`/api/comic-source/${id}`);
  },
  explore(id: string, page: string) {
    return Req.get(`/api/comic-source/${id}/explore/${page}`);
  },
  modify(id: string, values: SourceModifyBody) {
    return Req.patch(`/api/comic-source/${id}`, values);
  },
  execCallback(id: string, callback: string) {
    return Req.post(`/api/comic-source/${id}/callback/${callback}`);
  },
  doUAPLogin(id: string, username: string, password: string) {
    return Req.post(`/api/comic-source/${id}/login`, { username, password });
  },
  doCookieLogin(id: string, values: Record<string, string | undefined>) {
    return Req.post(`/api/comic-source/${id}/cookie-login`, values);
  },
  logout(id: string) {
    return Req.post(`/api/comic-source/${id}/logout`);
  }
} satisfies ComicSourceHandler;

