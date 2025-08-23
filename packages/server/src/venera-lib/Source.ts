export abstract class ComicSource {
    name = ""
    key = ""
    version = ""
    minAppVersion = ""
    url = ""

    loadData(dataKey: string): unknown {
      throw new Error("Calling not implemented method loadData(dataKey: string): any");
    }

    loadSetting(key: string): unknown {
        throw new Error("Calling not implemented method loadSetting(key: string): any");
    }

    saveData(dataKey: string, data: unknown) {
      throw new Error("Calling not implemented method saveData(dataKey: string, data: unknown): void");
    }

    deleteData(dataKey: string) {
      throw new Error("Calling not implemented method deleteData(dataKey: string): void");
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

export {};