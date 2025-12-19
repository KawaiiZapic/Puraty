import type { ComicHandler } from "@puraty/server";

import { Req } from ".";

export const Comic = {
	explore(id: string, exploreId: string, page = 1, next?: string) {
		const query = new URLSearchParams();
		query.set("page", page.toString());
		if (next) {
			query.set("next", next);
		}
		return Req.get(`/api/comic/${id}/explore/${exploreId}?${query}`);
	},
	detail(id: string, comicId: string) {
		return Req.get(`/api/comic/${id}/manga/${encodeURIComponent(comicId)}`);
	},
	pages(id: string, comicId: string, chapter?: string) {
		return Req.get(
			`/api/comic/${id}/manga/${encodeURIComponent(comicId)}/${chapter}`
		);
	},
	cache() {
		return Req.get("/api/comic/image/cache");
	},
	cleanCache(before: number) {
		return Req.delete("/api/comic/image/cache", { before });
	}
} satisfies ComicHandler;
