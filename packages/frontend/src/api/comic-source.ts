import { Req } from ".";

export interface SourceDetail {
  name: string;
  fileName: string;
  key: string;
  version: string;
  description?: string;
}
export interface InstalledSourceDetail {
  name: string;
  explore?: {
    id: number;
    type: string;
    title: string;
  }[];
}

export const ComicSource = {
  available: () => {
    return Req.get<SourceDetail[]>("/api/comic-source/available");
  },
  installed: () => {
    return Req.get<Record<string, string>>("/api/comic-source/installed");
  },
  install: (url: string, key: string) => {
    return Req.post("/api/comic-source/add", JSON.stringify({
      url,
      key
    }));
  },
  uninstall: (id: string) => {
    return Req.delete(`/api/comic-source/${id}`);
  },
  get(id: string) {
    return Req.get<InstalledSourceDetail>(`/api/comic-source/${id}`);
  },
  explore(id: string, page: string) {
    return Req.get<any>(`/api/comic-source/${id}/explore/${page}`);
  }
};