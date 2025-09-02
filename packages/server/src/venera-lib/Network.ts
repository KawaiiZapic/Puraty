import path from "tjs:path";
import { Database } from "tjs:sqlite";

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
class Cookie {
  public name: string;
  public value: string;
  public domain: string;

  constructor({name, value, domain}: Cookie) {
    this.name = name;
    this.value = value;
    this.domain = domain;
  }
}

class CookieStorage {
  private static _inst: CookieStorage;
  private db: Database;

  private constructor() {
    this.db = new Database(path.join(APP_DIR, "cookies.db"), {
      create: true,
      readOnly: false
    });
    this.db.exec("CREATE TABLE IF NOT EXISTS cookies (name TEXT, value TEXT, domain TEXT)");
    this.db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_cookies_domain_name ON cookies(domain, name);");
  }

  static get instance() {
    if (!CookieStorage._inst) {
      CookieStorage._inst = new CookieStorage();
    }
    return CookieStorage._inst;
  }

  delete(domain: string) {
    const st = this.db.prepare("DELETE FROM cookies WHERE domain=?;")
    st.run(domain);
    st.finalize();
  }

  get(domain: string): Cookie[] {
    const st = this.db.prepare("SELECT * FROM cookies WHERE domain=?;");
    const res = st.all(domain);
    st.finalize();
    return res;
  }

  set(domain: string, name: string, value: string) {
    const st = this.db.prepare("INSERT INTO cookies (name, value, domain) VALUES (?, ?, ?) ON CONFLICT(domain, name) DO UPDATE SET value = excluded.value;");
    st.run(name, value, domain);
    st.finalize();
  }
}

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