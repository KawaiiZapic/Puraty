import type {
	ComicHandler,
	ComicHistoryItem,
	ComicHistoryRecordBody,
	Paged
} from "@puraty/server";

import { Req } from ".";

export const Comic = {
	history(page = 1, pageSize = 20) {
		return Req.get<Paged<ComicHistoryItem>>("/api/comic/history", {
			page,
			pageSize
		});
	},
	comicHistory(sourceId: string, comicId: string) {
		return Req.get<{ item: ComicHistoryItem | null }>(
			`/api/comic/history/${encodeURIComponent(sourceId)}/${encodeURIComponent(comicId)}`
		);
	},
	recordHistory(item: ComicHistoryRecordBody) {
		return Req.post<void>("/api/comic/history", item);
	},
	deleteHistory(historyId: number) {
		return Req.delete<void>(`/api/comic/history/${historyId}`);
	},
	clearHistory() {
		return Req.delete<void>("/api/comic/history");
	},
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
	},
	search(id: string, keyword: string, page = 1, next?: string) {
		const query = new URLSearchParams();
		query.set("page", page.toString());
		query.set("q", keyword);
		if (next) {
			query.set("next", next);
		}
		return Req.get(`/api/comic/${id}/search?${query}`);
	}
} satisfies ComicHandler;
