import type { ComicHandler } from "@puraty/server";

import { Req } from ".";

export const Comic = {
	explore(id: string, page: string) {
		return Req.get(`/api/comic/${id}/explore/${page}`);
	},
	detail(id: string, comicId: string) {
		return Req.get(`/api/comic/${id}/manga/${encodeURIComponent(comicId)}`);
	},
	pages(id: string, comicId: string, chapter?: string) {
		return Req.get(
			`/api/comic/${id}/manga/${encodeURIComponent(comicId)}/${chapter}`
		);
	}
} satisfies ComicHandler;
