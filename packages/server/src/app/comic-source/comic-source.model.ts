import type { ComicSource } from "@/venera-lib";
import type { AnySettingItem, BaseExplorePage, MixedExplorePage, MPCLExplorePage, MPPExplorePage, SPWMPExplorePage } from "@/venera-lib/Source";

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
  key: string;
  name: string;
  version: string;
  explore?: {
    id: number;
    title: string;
    type: Required<ComicSource>["explore"][number]["type"];
  }[];
  isLogged?: boolean;
  features: {
    UAPLogin: boolean;
    CookieLogin?: string[];
    logout: boolean;
  };
  settings?: Record<string, AnySettingItem>;
  settingValues: Record<string, string>;
}

export interface SourceModifyBody {
  settingValues?: Record<string, string>;
}

export interface UAPLoginBody {
  username: string;
  password: string;
}

type _ExplorePageResult<T extends BaseExplorePage> = {
  type: T["type"];
  data: Awaited<ReturnType<T["load"]>>;
}

export type ExplorePageResult = _ExplorePageResult<MPPExplorePage> | _ExplorePageResult<MixedExplorePage> | _ExplorePageResult<MPCLExplorePage> | _ExplorePageResult<SPWMPExplorePage>;