import path from "tjs:path";

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
import type { ComicDetails, ImageLoadingConfig } from "@/venera-lib";

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
		const source = await ComicSourceService.get(id);
		try {
			const f = await ComicService.getImageCache(
				id,
				image,
				comicId,
				epId,
				page
			);
			if (!f) {
				let res: Response | undefined = undefined;
				let retry = 0;
				while (!res && retry < 3) {
					try {
						let realUrl = image;
						let imageLoadingConfig: ImageLoadingConfig | null = null;
						if (source.comic.onImageLoad && comicId && epId) {
							imageLoadingConfig = await source.comic.onImageLoad(
								image,
								comicId,
								epId
							);
						} else if (source.comic.onThumbnailLoad && comicId) {
							imageLoadingConfig = await source.comic.onThumbnailLoad(image);
						}
						if (imageLoadingConfig) {
							if (imageLoadingConfig.url) {
								realUrl = imageLoadingConfig.url;
							}
							if (imageLoadingConfig.modifyImage) {
								// TODO: image load hooks
								console.warn(
									"Source required image load hooks, but not implemented yet."
								);
							}
						}
						res = await fetch(realUrl, {
							signal: AbortSignal.timeout(30000)
						});
					} catch (e) {
						retry++;
						console.error(e);
					}
				}
				if (res?.ok) {
					const buffer = await res.arrayBuffer();
					const ubuffer = new Uint8Array(buffer);
					await ComicService.saveImageCache(
						ubuffer,
						id,
						image,
						comicId,
						epId,
						page
					);
					return new Response(buffer, {
						status: 200,
						headers: {
							"content-type": res.headers.get("content-type") ?? "",
							"content-length": res.headers.get("content-length") ?? ""
						}
					});
				} else {
					throw createHttpError(
						500,
						"Failed to load image, image url return a not ok status"
					);
				}
			} else {
				const resp = new Response(f.readable, {
					status: 200,
					headers: {
						"content-type": "image/" + path.extname(f.path).substring(1),
						"content-length": (await f.stat()).size.toString()
					}
				});
				return resp;
			}
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
