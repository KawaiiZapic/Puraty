import { BaseDB } from "./base";

export interface SourceDetail {
  key: string;
  version: string;
}

export class InstalledSource extends BaseDB {
  protected VERSION: number = 0;
  private static _instance: InstalledSource;

  private constructor() {
    super("installed_source");
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new InstalledSource();
    }
    return this._instance;
  }

  protected initialize(): void {
    this.db.exec("CREATE TABLE installed_source (key TEXT PRIMARY KEY, version TEXT);");
  }

  protected upgrade(): void { }

  list(): Record<string, string> {
    const st = this.db.prepare("SELECT * from installed_source;");
    const res: Record<string, string> = {};
    st.all().forEach(v => {
      res[v.key] = v.version;
    });
    st.finalize();
    return res;
  }

  get(name: string): SourceDetail | undefined {
    const st = this.db.prepare("SELECT * from installed_source where key=?;");
    const result = st.all(name)[0];
    st.finalize();
    return result;
  }

  install(key: string, version: string) {
    const st = this.db.prepare("INSERT OR REPLACE INTO installed_source (key, version) VALUES (?, ?);");
    st.run(key, version);
    st.finalize();
  }

  delete(name: string) {
    const st = this.db.prepare("DELETE from installed_source where key=?;");
    st.run(name);
    st.finalize();
  }
}