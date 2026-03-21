import { ComicSourceService } from "@/app/comic-source/comic-source.service";
import {
	Controller,
	Delete,
	Get,
	NotRequired,
	Integer,
	Path,
	Query
} from "@/utils/decorators";
import { createHttpError } from "@/utils/error";
import { LRU } from "@/utils/LRU";
import { QueueLock } from "@/utils/QueueLock";
import type { ComicDetails } from "@/venera-lib";

import { ComicCache } from "./comic.db";
import type { ComicChapterResult, ExplorePageResult } from "./comic.model";
import { ComicService } from "./comic.service";

@Controller("/comic")
export class ComicHandler {
	private queueLock = new QueueLock(5);

	private ComicDetailsCache = new LRU<ComicDetails>(50);
	private ComicChapterCache = new LRU<ComicChapterResult>(50);

	@Get("/:id/explore/:explore")
	async explore(
		@Path("id") id: string,
		@Integer @Path("explore") explore: number,
		@NotRequired @Integer @Query("page") page: number = 1,
		@NotRequired @Query("next") next?: string
	) {
		const source = await ComicSourceService.get(id);
		const explorePage = source.explore?.[explore];
		if (!explorePage) {
			throw createHttpError(
				404,
				"Comic source explore page not found: " + id + ":" + explore
			);
		}
		try {
			let data;
			if (explorePage.type === "multiPageComicList") {
				data = await (explorePage.loadNext
					? explorePage.loadNext(next ?? null)
					: explorePage.load(page));
			} else {
				data = await explorePage.load(page);
			}
			return {
				data,
				type: explorePage.type,
				title: source.translate(explorePage.title)
			} as ExplorePageResult;
		} catch (e) {
			console.error(e);
			throw createHttpError(500, "Comic source failed to load data: " + e, e);
		}
	}

	@Get("/:id/search")
	async search(
		@Path("id") id: string,
		@Query("q") keyword: string,
		@NotRequired @Integer @Query("page") page: number = 1,
		@NotRequired @Query("next") next: string | null = null
	) {
		const source = await ComicSourceService.get(id);
		try {
			if (source.search?.load) {
				return await source.search.load(keyword, [], page);
			} else if (source.search?.loadNext) {
				return await source.search.loadNext(keyword, [], next);
			} else {
				throw new Error(`Comic source ${id} does not support search`);
			}
		} catch (e) {
			console.error(e);
			throw createHttpError(500, "Comic source failed to load data: " + e, e);
		}
	}

	@Get("/:id/manga/:comicId")
	async detail(@Path("id") id: string, @Path("comicId") comicId: string) {
		const cacheKey = `${id}-${comicId}`;
		if (this.ComicDetailsCache.has(cacheKey)) {
			return this.ComicDetailsCache.get(cacheKey)!;
		}
		const source = await ComicSourceService.get(id);
		try {
			const r = {
				...(await source.comic.loadInfo(decodeURIComponent(comicId)))
			} as ComicDetails;
			if (r.tags) {
				const translateTags: Record<string, string[] | string> = {};
				if (r.tags instanceof Map) {
					r.tags.forEach((v, k) => {
						translateTags[source.translate(k)] = v;
					});
				} else {
					for (const tag in r.tags) {
						translateTags[source.translate(tag)] = r.tags[tag];
					}
				}
				r.tags = translateTags;
			}
			this.ComicDetailsCache.set(cacheKey, r);
			return r;
		} catch (e) {
			console.error(e);
			throw createHttpError(500, "Comic source failed to load data: " + e, e);
		}
	}

	@Get("/:id/manga/:comicId/:chapter")
	async pages(
		@Path("id") id: string,
		@Path("comicId") comicId: string,
		@Path("chapter") chapter: string
	): Promise<ComicChapterResult> {
		const cacheKey = `${id}-${comicId}-${chapter}`;
		if (this.ComicChapterCache.has(cacheKey)) {
			return this.ComicChapterCache.get(cacheKey)!;
		}
		const source = await ComicSourceService.get(id);
		try {
			const result: ComicChapterResult = {
				...(await source.comic.loadEp(decodeURIComponent(comicId), chapter)),
				hasImageLoadHook: !!source.comic.onImageLoad
			};
			this.ComicChapterCache.set(cacheKey, result);
			return result;
		} catch (e) {
			console.error(e);
			throw createHttpError(500, "Comic source failed to load data: " + e, e);
		}
	}

	@Get("/image")
	async image(
		@Query("source") id: string,
		@Query("comicId") comicId: string,
		@Query("epId") epId: string,
		@Query("page") page: string,
		@Query("image") image: string
	) {
		await this.queueLock.acquire();
		try {
			const result = await ComicService.fetchImage(
				id,
				comicId,
				epId,
				page,
				image
			);
			return new Response(result.data, {
				status: 200,
				headers: {
					"content-type": result.contentType,
					"content-length": result.size.toString()
				}
			});
		} catch (e) {
			throw createHttpError(500, "Failed to load image: " + e, e);
		} finally {
			this.queueLock.release();
		}
	}
	@Get("/image/cache")
	async cache() {
		const size = ComicCache.totalSize();
		const time = {
			D3: Date.now() - 1000 * 60 * 60 * 24 * 3,
			D7: Date.now() - 1000 * 60 * 60 * 24 * 7,
			D30: Date.now() - 1000 * 60 * 60 * 24 * 30,
			D365: Date.now() - 1000 * 60 * 60 * 24 * 365
		};
		const D3 = ComicCache.sizeBetweenDate(time.D3);
		const D7 = ComicCache.sizeBetweenDate(time.D7, time.D3);
		const D30 = ComicCache.sizeBetweenDate(time.D30, time.D7);
		const D365 = ComicCache.sizeBetweenDate(time.D365, time.D30);
		return {
			size,
			D3,
			D7,
			D30,
			D365
		};
	}

	@Delete("/image/cache")
	async cleanCache(@Integer @Query("before") before: number) {
		await ComicService.cleanCache(before);
	}
}
