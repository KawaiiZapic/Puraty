import { BaseDB } from "./base";

export class AppData extends BaseDB {
  protected VERSION: number = 0;
  private static _instance: AppData;

  private constructor() {
    super("app");
  }

  static get db() {
    if (!this._instance) {
      this._instance = new AppData();
    }
    return this._instance.db;
  }

  protected initialize(): void {
    this.db.exec("CREATE TABLE app_data (key TEXT PRIMARY KEY, value TEXT);");
  }

  protected upgrade(): void { }

  static get(name: string): string | undefined {
    const st = this.db.prepare("SELECT value from app_data where key=?;");
    const result = st.all(name)[0]?.value;
    st.finalize();
    return result;
  }

  static set(name: string, data: string) {
    const st = this.db.prepare("INSERT OR REPLACE INTO app_data (key, value) VALUES (?, ?);");
    st.run(name, data);
    st.finalize();
  }

  static delete(name: string) {
    const st = this.db.prepare("DELETE from app_data where key=?;");
    st.run(name);
    st.finalize();
  }
}