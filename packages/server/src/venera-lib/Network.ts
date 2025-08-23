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

const Network = {
  async fetchBytes(
    method: string, 
    url: string, 
    headers: Record<string, string>, 
    data?: BodyInit
  ): Promise<RequestResult<ArrayBuffer>> {
    const resp = await fetch(url, {
      method,
      headers,
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
    headers: Record<string, string>, 
    data?: BodyInit
  ): Promise<RequestResult> {
    const resp = await fetch(url, {
      method,
      headers,
      body: data
    });

    return {
      status: resp.status,
      headers: convertHeaders(resp.headers),
      body: await resp.text()
    }
  },

  async get(url: string, headers: Record<string, string>): Promise<RequestResult> {
    return this.sendRequest('GET', url, headers);
  },

  async post(url: string, headers: Record<string, string>, data: BodyInit): Promise<RequestResult> {
    return this.sendRequest('POST', url, headers, data);
  },

  async put(url: string, headers: Record<string, string>, data: BodyInit): Promise<RequestResult> {
    return this.sendRequest('PUT', url, headers, data);
  },

  async patch(url: string, headers: Record<string, string>, data: BodyInit): Promise<RequestResult> {
    return this.sendRequest('PATCH', url, headers, data);
  },

  async delete(url: string, headers: Record<string, string>): Promise<RequestResult> {
    return this.sendRequest('DELETE', url, headers);
  },
  setCookies(url: string, cookies: Cookie[]) {
    throw new Error("Calling not implemented method setCookies(url: string, cookies: ICookie[]): void");
  },
  getCookies(url: string): Promise<Cookie[]> {
    throw new Error("Calling not implemented method getCookies(url: string): Promise<ICookie[]>");
  },
  deleteCookies(url: string) {
    throw new Error("Calling not implemented method deleteCookies(url: string): void");
  },
};