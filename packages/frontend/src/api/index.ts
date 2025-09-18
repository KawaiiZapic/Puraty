import { ComicSource } from "./comic-source";
import { Command } from "./command";

export default {
  Command,
  ComicSource
};

export const Req = {
  async send<T>(method: string, url: string, _body?: BodyInit | object): Promise<T> {
    let body: BodyInit;
    if ([ReadableStream, Blob, FormData, URLSearchParams ].some(t => _body instanceof t)) {
      body = _body as any;
    } else if (typeof _body !== "string") {
      body = JSON.stringify(_body);
    } else {
      body = _body;
    }
    const v = await fetch(url, {
      method,
      body
    });
    if (v.status >= 400) {
      throw new Error("Network request failed with non-2xx status code");
    }
    if (v.headers.get("content-type")?.startsWith("application/json")) {
      return await v.json();
    } else {
      return await v.text() as T;
    }
  },
  get<T>(url: string, params?: Record<string, string | number | boolean>) {
    return Req.send<T>(
      "GET", 
      url 
        + (
          params 
            ? "?" + new URLSearchParams(params as Record<string, string>).toString() 
            : ""
        )
      );
  },
  post<T>(url: string, body?: BodyInit | object) {
    return Req.send<T>("POST", url, body);
  },
  patch<T>(url: string, body?: BodyInit | object) {
    return Req.send<T>("PATCH", url, body);
  },
  delete<T>(url: string, params?: Record<string, string | number | boolean>) {return Req.send<T>(
      "DELETE", 
      url 
        + (
          params 
            ? "?" + new URLSearchParams(params as Record<string, string>).toString() 
            : ""
        )
      );
  }
};