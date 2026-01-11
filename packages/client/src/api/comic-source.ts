import type { ComicSourceHandler, SourceModifyBody } from "@puraty/server";

import { Req } from ".";

export const ComicSource = {
	available() {
		return Req.get("/api/comic-source/available");
	},
	list(allowErr = false) {
		return Req.get(
			"/api/comic-source/installed?allowInitializeError=" + allowErr
		);
	},
	add(url: string, key: string) {
		return Req.post("/api/comic-source/add", {
			url,
			key
		});
	},
	delete(id: string) {
		return Req.delete(`/api/comic-source/${id}`);
	},
	get(id: string) {
		return Req.get(`/api/comic-source/${id}`);
	},
	modify(id: string, values: SourceModifyBody) {
		return Req.patch(`/api/comic-source/${id}`, values);
	},
	execCallback(id: string, callback: string) {
		return Req.post(`/api/comic-source/${id}/callback/${callback}`);
	},
	basicLogin(id: string, username: string, password: string) {
		return Req.post(`/api/comic-source/${id}/login`, { username, password });
	},
	cookieLogin(id: string, values: Record<string, string | undefined>) {
		return Req.post(`/api/comic-source/${id}/cookie-login`, values);
	},
	logout(id: string) {
		return Req.post(`/api/comic-source/${id}/logout`);
	}
} satisfies ComicSourceHandler;
