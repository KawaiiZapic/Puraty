import { HTTPError } from "h3";
import path from "tjs:path";

import { ComicSourceService } from "@/app/comic-source/comic-source.service";
import {
	Controller,
	Delete,
	Get,
	Path,
	Query,
	Required
} from "@/utils/decorators";
import { QueueLock } from "@/utils/QueueLock";
import type { ComicDetails } from "@/venera-lib";

import { ComicCache } from "./comic.db";
import type { ExplorePageResult } from "./comic.model";
import { ComicService } from "./comic.service";

@Controller("/comic")
export class ComicHandler {
	private queueLock = new QueueLock(5);

	@Get("/:id/explore/:explore")
	async explore(@Path("id") id: string, @Path("explore") _explore: string) {
		const explore = parseInt(_explore);
		const source = await ComicSourceService.get(id);
		const explorePage = source.explore?.[explore];
		if (!explorePage) {
			throw new HTTPError(
				"Comic source explore page not found: " + id + ":" + explore,
				{ status: 404 }
			);
		}
		try {
			let data;
			if (explorePage.type === "multiPageComicList") {
				data = await (explorePage.loadNext
					? explorePage.loadNext(null)
					: explorePage.load(1));
			} else {
				data = await explorePage.load(null);
			}
			return {
				data,
				type: explorePage.type
			} as ExplorePageResult;
		} catch (e) {
			console.error(e);
			throw new HTTPError("Comic source failed to load data: " + e, {
				status: 500
			});
		}
	}

	@Get("/:id/manga/:comicId")
	async detail(@Path("id") id: string, @Path("comicId") comicId: string) {
		const source = await ComicSourceService.get(id);
		try {
			const r = {
				...(await source.comic.loadInfo(decodeURIComponent(comicId)))
			} as ComicDetails;
			if (r.tags) {
				const translateTags: Record<string, string[]> = {};
				for (const tag in r.tags) {
					translateTags[source.translate(tag)] = r.tags[tag];
				}
				r.tags = translateTags;
			}
			return r;
		} catch (e) {
			console.error(e);
			throw new HTTPError("Comic source failed to load data: " + e, {
				status: 500
			});
		}
	}

	@Get("/:id/manga/:comicId/:chapter")
	async pages(
		@Path("id") id: string,
		@Path("comicId") comicId: string,
		@Path("chapter") chapter: string
	) {
		const source = await ComicSourceService.get(id);
		try {
			return {
				...(await source.comic.loadEp(decodeURIComponent(comicId), chapter)),
				hasImageLoadHook: !!source.comic.onImageLoad
			};
		} catch (e) {
			console.error(e);
			throw new HTTPError("Comic source failed to load data: " + e, {
				status: 500
			});
		}
	}

	@Get("/image")
	async image(
		@Required @Query("source") source: string,
		@Query("comicId") comicId: string,
		@Query("epId") epId: string,
		@Query("page") page: string,
		@Required @Query("image") image: string
	) {
		const f = await ComicService.getImageCache(
			source,
			image,
			comicId,
			epId,
			page
		);
		if (!f) {
			await this.queueLock.acquire();
			try {
				let res: Response | undefined = undefined;
				let retry = 0;
				while (!res && retry < 3) {
					try {
						res = await fetch(image);
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
						source,
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
					throw new HTTPError(
						"Failed to load image, image url return a not ok status",
						{ status: 500 }
					);
				}
			} finally {
				this.queueLock.release();
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
	}
	@Get("/image/cache")
	async cache() {
		const size = ComicCache.totalSize();
		const D3 = ComicCache.sizeBetweenDate(Date.now() - 1000 * 60 * 60 * 24 * 3);
		const D7 = ComicCache.sizeBetweenDate(Date.now() - 1000 * 60 * 60 * 24 * 7);
		const D30 = ComicCache.sizeBetweenDate(
			Date.now() - 1000 * 60 * 60 * 24 * 30
		);
		const D365 = ComicCache.sizeBetweenDate(
			Date.now() - 1000 * 60 * 60 * 24 * 365
		);
		return {
			size,
			D3,
			D7,
			D30,
			D365
		};
	}

	@Delete("/image/cache")
	async cleanCache(@Required @Query("before") before: string) {
		await ComicService.cleanCache(parseInt(before));
	}
}
