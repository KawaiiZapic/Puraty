import { ComicSource } from "./comic-source";
import { Command } from "./command";

export default {
  Command,
  ComicSource
};

export const Req = {
  async send<T>(method: string, url: string, body?: BodyInit): Promise<T> {
    const v = await fetch(url, {
      method,
      body
    });
    if (v.status >= 400) {
      throw new Error("Network request failed with non-2xx status code");
    }
    return await v.json();
  },
  get<T>(url: string, params?: Record<string, string | number | boolean>) {
    return Req.send<T>(
      "get", 
      url 
        + (
          params 
            ? "?" + new URLSearchParams(params as Record<string, string>).toString() 
            : ""
        )
      );
  },
  post<T>(url: string, body?: BodyInit) {
    return Req.send<T>("post", url, body);
  }
};