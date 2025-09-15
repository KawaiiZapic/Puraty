import type { ComicSource } from "@/venera-lib";

export interface NetworkSourceDetail {
  name: string;
  fileName: string;
  key: string;
  version: string;
  description?: string;
}

export interface InstallBody {
  url: string;
  key: string;
}

export interface InstalledSourceDetail {
  name: string;
  explore?: {
    id: number;
    title: string;
    type: Required<ComicSource>["explore"][number]["type"];
  }[];
}