import { CookieStorage, Cookie } from "@/db/Cookies";

interface RequestResult<T extends ArrayBuffer| string = string> {
  status: number; 
  headers: Record<string, string>; 
  body: T;
}

const convertHeaders = (h: Headers) => {
  const r: Record<string, string> = {};
  h.forEach((v, k) => {
    r[k] = v;
  });
  return r;
};

const getCookieHeader = (url: string): string => {
  const domain = new URL(url).hostname;
  const cookies = CookieStorage.instance.get(domain);
  return cookies.map(c => {
    return `${encodeURIComponent(c.name)}=${encodeURIComponent(c.value)}`
  }).join("; ");
}

export const Network = {
  async fetchBytes(
    method: string, 
    url: string, 
    headers?: Record<string, string>, 
    data?: BodyInit
  ): Promise<RequestResult<ArrayBuffer>> {
    const resp = await fetch(url, {
      method,
      headers: {
        Cookie: (getCookieHeader(url) || undefined) as string,
        ...headers,
      },
      body: data
    });

    return {
      status: resp.status,
      headers: convertHeaders(resp.headers),
      body: await resp.arrayBuffer()
    }
  },

  async sendRequest(
    method: string, 
    url: string, 
    headers?: Record<string, string>, 
    data?: BodyInit
  ): Promise<RequestResult> {
    const resp = await fetch(url, {
      method,
      headers: {
        Cookie: (getCookieHeader(url) || undefined) as string,
        ...headers,
      },
      body: data
    });

    return {
      status: resp.status,
      headers: convertHeaders(resp.headers),
      body: await resp.text()
    }
  },

  async get(url: string, headers?: Record<string, string>): Promise<RequestResult> {
    return this.sendRequest('GET', url, headers);
  },

  async post(url: string, headers?: Record<string, string>, data?: BodyInit): Promise<RequestResult> {
    return this.sendRequest('POST', url, headers, data);
  },

  async put(url: string, headers?: Record<string, string>, data?: BodyInit): Promise<RequestResult> {
    return this.sendRequest('PUT', url, headers, data);
  },

  async patch(url: string, headers?: Record<string, string>, data?: BodyInit): Promise<RequestResult> {
    return this.sendRequest('PATCH', url, headers, data);
  },

  async delete(url: string, headers?: Record<string, string>): Promise<RequestResult> {
    return this.sendRequest('DELETE', url, headers);
  },
  setCookies(url: string, cookies: Cookie[]) {
    cookies.forEach(c => {
      CookieStorage.instance.set(c.domain, c.name, c.value);
    });
  },
  async getCookies(url: string): Promise<Cookie[]> {
    const domain = new URL(url).hostname;
    return CookieStorage.instance.get(domain);
  },
  deleteCookies(url: string) {
    const domain = new URL(url).hostname;
    CookieStorage.instance.delete(domain);
  }
};