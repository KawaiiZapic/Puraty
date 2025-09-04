import { SourceData } from "@/db/SourceData";
import { APP } from "./App";

interface SettingItem {
  type: "select";
  title: string;
  options?: string[];
  default?: string;
}

export abstract class ComicSource {
    public name = "";
    public key = "";
    public version = "";
    public minAppVersion = "";
    public url = "";
    private sd = SourceData.instance;
    protected abstract settings: Record<string, SettingItem>;

    loadData(dataKey: string): string {
      return this.sd.get("data", this.key, dataKey);
    }

    loadSetting(key: string): string {
      return this.sd.get("setting", this.key, key) ?? this.settings[key]?.default;
    }

    saveData(dataKey: string, data: string) {
      this.sd.set("data", this.key, dataKey, data)
    }

    deleteData(dataKey: string) {
      this.sd.delete("data", this.key, dataKey);
    }

    get isLogged(): boolean {
      return true;
    }

    translation: Record<string, Record<string, string>> = {}

    translate(key: string): string {
        let locale = APP.locale;
        return this.translation[locale]?.[key] ?? key;
    }

    init() { }

    static sources = {}
}