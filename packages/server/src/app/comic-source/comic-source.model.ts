import type { ComicSource } from "@/venera-lib";
import type { AnySettingItem } from "@/venera-lib/Source";

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
  settings?: Record<string, AnySettingItem>;
  settingValues: Record<string, string>;
}

export interface SourceModifyBody {
  settingValues?: Record<string, string>;
}