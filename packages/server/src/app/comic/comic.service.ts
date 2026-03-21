import { createHash } from "tjs:hashing";
import path from "tjs:path";

import { ComicSourceService } from "../comic-source/comic-source.service";
import type { ImageLoadingConfig } from "@/venera-lib";

import { ComicCache } from "./comic.db";

const sha1sum = (msg: string) => createHash("sha1").update(msg).digest();

const getExt = (url: string) => {
	try {
		return path.extname(url);
	} catch (_) {
		return "";
	}
};
export class ComicService {
	static async getImageCache(
		source: string,
		url: string,
		comicId?: string,
		chapter?: string,
		page?: string
	) {
		const hash = sha1sum(
			`${source}_${comicId ?? ""}_${chapter ?? ""}_${page ?? ""}`
		);
		const fname = hash + getExt(url);
		const h2 = hash.substring(0, 2);
		const file = path.join(APP_DIR, "cache", h2, fname);
		try {
			const f = await tjs.open(file, "r");
			if ((await f.stat()).size === 0) {
				return;
			}
			ComicCache.access(fname);
			return f;
		} catch (_) {
			return;
		}
	}

	static async saveImageCache(
		data: Uint8Array,
		source: string,
		url: string,
		comicId?: string,
		chapter?: string,
		page?: string
	) {
		const hash = sha1sum(
			`${source}_${comicId ?? ""}_${chapter ?? ""}_${page ?? ""}`
		);
		const h2 = hash.substring(0, 2);
		const fname = hash + getExt(url);
		const file = path.join(APP_DIR, "cache", h2, fname);
		await tjs.makeDir(path.dirname(file), { recursive: true });
		const f = await tjs.open(file, "w");
		await f.write(data);
		f.close();
		ComicCache.insert(fname, data.byteLength);
	}

	static async cleanCache(before: number) {
		const list = ComicCache.betweenDate(before);
		for (const item of list) {
			try {
				const h2 = item.id.substring(0, 2);
				await tjs.remove(path.join(APP_DIR, "cache", h2, item.id));
			} catch {}
			ComicCache.delete(item.id);
		}
	}

	static async fetchImage(
		id: string,
		comicId: string,
		epId: string,
		page: string,
		image: string
	) {
		const source = await ComicSourceService.get(id);
		const f = await ComicService.getImageCache(id, image, comicId, epId, page);
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
								`Source ${id} required image load hooks, but not implemented yet.`
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
				return {
					contentType: res.headers.get("content-type") ?? "",
					data: ubuffer,
					size: ubuffer.byteLength
				};
			} else {
				throw new Error(
					"Failed to load image, image url return a not ok status"
				);
			}
		} else {
			return {
				contentType: "image/" + path.extname(f.path).substring(1),
				data: f.readable,
				size: (await f.stat()).size
			};
		}
	}
}
