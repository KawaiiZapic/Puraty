import { BaseDB } from "./base";

export class SourceData extends BaseDB {
  protected VERSION: number = 0;
  private static _instance: SourceData;

  private constructor() {
    super("comic_source_data");
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new SourceData();
    }
    return this._instance;
  }

  protected initialize(): void {
    this.db.exec("CREATE TABLE source_data (key TEXT PRIMARY KEY, value TEXT);");
  }

  protected upgrade(): void { }

  get(type: string, id: string, name: string): string {
    const st = this.db.prepare("SELECT value from source_data where key=?;");
    const result = st.all(`${type}_${id}_${name}`)[0]?.value;
    st.finalize();
    return result;
  }

  set(type: string, id: string, name: string, data: string) {
    const st = this.db.prepare("INSERT OR REPLACE INTO source_data (key, value) VALUES (?, ?);");
    st.run(`${type}_${id}_${name}`, data);
    st.finalize();
  }

  delete(type: string, id: string, name: string) {
    const st = this.db.prepare("DELETE from source_data where key=?;");
    st.run(`${type}_${id}_${name}`);
    st.finalize();
  }
}