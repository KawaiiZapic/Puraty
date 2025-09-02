import path from "tjs:path";
import { Database } from "tjs:sqlite";

const dbSymbol = Symbol("DB");
export abstract class ComicSource {
    public name = "";
    public key = "";
    public version = "";
    public minAppVersion = "";
    public url = "";
    private static [dbSymbol]: Database;

    private getSqliteDB(): Database {
      if (!ComicSource[dbSymbol]) {
        const db = new Database(path.join(APP_DIR, "comic_source_data.db"), {
          create: true,
          readOnly: false
        });
        db.exec("CREATE TABLE IF NOT EXISTS source_data (key TEXT PRIMARY KEY, value TEXT)");
        db.exec("CREATE TABLE IF NOT EXISTS source_settings (key TEXT PRIMARY KEY, value TEXT)");
        ComicSource[dbSymbol] = db;
      }
      return ComicSource[dbSymbol];
    }

    loadData(dataKey: string): string {
      const db = this.getSqliteDB();
      const st = db.prepare("SELECT value from source_data where key=?;");
      const result = st.all(this.key + "_" + dataKey)[0]?.value;
      st.finalize();
      return result;
    }

    loadSetting(key: string): string {
      const db = this.getSqliteDB();
      const st = db.prepare("SELECT value from source_settings where key=?;");
      const result = st.all(this.key + "_" + key)[0]?.value;
      st.finalize();
      return result;
    }

    saveData(dataKey: string, data: string) {
      const db = this.getSqliteDB();
      const st = db.prepare("INSERT OR REPLACE INTO source_data (key, value) VALUES (?, ?);");
      st.run(this.key + "_" + dataKey, data);
      st.finalize();
    }

    deleteData(dataKey: string) {
      const db = this.getSqliteDB();
      const st = db.prepare("DELETE from source_data where key=?;");
      st.run(this.key + "_" + dataKey);
      st.finalize();
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