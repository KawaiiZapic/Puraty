import path from "tjs:path";
import { Database } from "tjs:sqlite";

export abstract class BaseDB {
  protected db: Database;
  protected VERSION = 0;

  constructor(name: string) {
    const db = new Database(path.join(APP_DIR, "data.db"), {
      readOnly: false,
      create: true
    });
    this.db = db;
    try {
      const version = db.prepare("SELECT version FROM puraty_db_meta WHERE name=?").all(name)[0]?.version;
      if (typeof version !== "string") {
        this.initialize();
      } else if (version !== this.VERSION.toString()) {
        this.upgrade();
        db.prepare("UPDATE puraty_db_meta SET version=? WHERE name=?").run(this.VERSION, name);
      }
    } catch (e) {
      db.exec("CREATE TABLE puraty_db_meta (name TEXT, version TEXT)");
      db.prepare("INSERT INTO puraty_db_meta (name, version) VALUES (?, ?)").run(name, this.VERSION);
      this.initialize();
    }
  }

  protected abstract initialize(): void;
  protected abstract upgrade(): void;
}