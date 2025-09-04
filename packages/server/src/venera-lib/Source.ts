import { SourceData } from "@/db/SourceData";

export abstract class ComicSource {
    public name = "";
    public key = "";
    public version = "";
    public minAppVersion = "";
    public url = "";
    private sd = SourceData.instance;

    loadData(dataKey: string): string {
      return this.sd.get("data", this.key, dataKey);
    }

    loadSetting(key: string): string {
      return this.sd.get("setting", this.key, key);
    }

    saveData(dataKey: string, data: string) {
      this.sd.set("data", this.key, dataKey, data)
    }

    deleteData(dataKey: string) {
      this.sd.delete("data", this.key, dataKey);
    }

    get isLogged(): boolean {
      throw new Error("Calling not implemented getter isLogged(): boolean");
    }

    translation: Record<string, Record<string, string>> = {}

    translate(key: string): string {
      throw new Error("Calling not implemented method translate(key: string): string");
    }

    init() { }

    static sources = {}
}