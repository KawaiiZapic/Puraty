import { Comic } from "./comic";
import { ComicSource } from "./comic-source";
import { Command } from "./command";

export class NetworkError extends Error {
	public data?: unknown;

	constructor(res?: Response | TypeError, data?: unknown) {
		if (res instanceof Response) {
			super("Network request failed: " + res.status + " " + res.statusText);
			this.data = data;
		} else if (res instanceof TypeError) {
			super("Network request failed: " + res.message);
		}
	}
}

export const Req = {
	async send<T>(
		method: string,
		url: string,
		_body?: BodyInit | object
	): Promise<T> {
		let body: BodyInit;
		if (
			[ReadableStream, Blob, FormData, URLSearchParams].some(
				t => _body instanceof t
			)
		) {
			body = _body as never;
		} else if (typeof _body !== "string") {
			body = JSON.stringify(_body);
		} else {
			body = _body;
		}
		let v: Response;
		try {
			v = await fetch(url, {
				method,
				body
			});
			if (v.status >= 400) {
				let data: unknown = await v.text();
				try {
					data = JSON.parse(data as string);
				} catch (_) {}
				throw new NetworkError(v, data);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw new NetworkError(e);
			}
			throw e;
		}

		if (v.headers.get("content-type")?.startsWith("application/json")) {
			return await v.json();
		} else {
			return (await v.text()) as T;
		}
	},
	get<T>(url: string, params?: Record<string, string | number | boolean>) {
		return Req.send<T>(
			"GET",
			url +
				(params
					? "?" +
						new URLSearchParams(params as Record<string, string>).toString()
					: "")
		);
	},
	post<T>(url: string, body?: BodyInit | object) {
		return Req.send<T>("POST", url, body);
	},
	patch<T>(url: string, body?: BodyInit | object) {
		return Req.send<T>("PATCH", url, body);
	},
	delete<T>(url: string, params?: Record<string, string | number | boolean>) {
		return Req.send<T>(
			"DELETE",
			url +
				(params
					? "?" +
						new URLSearchParams(params as Record<string, string>).toString()
					: "")
		);
	},
	normalizeError(e: unknown) {
		if (e instanceof NetworkError) {
			if (e.data) {
				if (
					typeof e.data === "object" &&
					"message" in e.data &&
					typeof e.data.message === "string"
				) {
					return e.data.message;
				}
			}
			return "网络错误";
		}
		return String(e);
	}
};

export default {
	Command,
	ComicSource,
	Comic,
	proxy(
		source: string,
		url: string,
		comicId: string,
		epId?: string,
		page?: string
	) {
		const params = new URLSearchParams({
			source,
			comicId: comicId ?? "",
			image: url,
			epId: epId ?? "",
			page: page ?? ""
		});
		return "/api/comic/image?" + params;
	},
	normalizeError: Req.normalizeError
};
