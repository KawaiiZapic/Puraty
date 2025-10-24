import CryptoJS from "crypto-js";
import path from "tjs:path";

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
		const hash = CryptoJS.SHA1(
			`${source}_${comicId ?? ""}_${chapter ?? ""}_${page ?? ""}`
		).toString(CryptoJS.enc.Hex);
		const h2 = hash.substring(0, 2);
		const file = path.join(APP_DIR, "cache", h2, hash + getExt(url));
		try {
			const f = await tjs.open(file, "r");
			if ((await f.stat()).size === 0) {
				return;
			}
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
		const hash = CryptoJS.SHA1(
			`${source}_${comicId ?? ""}_${chapter ?? ""}_${page ?? ""}`
		).toString(CryptoJS.enc.Hex);
		const h2 = hash.substring(0, 2);
		const file = path.join(APP_DIR, "cache", h2, hash + getExt(url));
		await tjs.makeDir(path.dirname(file), { recursive: true });
		const f = await tjs.open(file, "w");
		await f.write(data);
		f.close();
	}
}
