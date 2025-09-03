import { BaseDB } from "./base";

export class Cookie {
  public name: string;
  public value: string;
  public domain: string;

  constructor({name, value, domain}: Cookie) {
    this.name = name;
    this.value = value;
    this.domain = domain;
  }
}

export class CookieStorage extends BaseDB {
  protected VERSION: number = 0;
  private static _instance: CookieStorage;

  private constructor() {
    super("cookies");
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new CookieStorage();
    }
    return this._instance;
  }

  protected initialize() {
    this.db.exec("CREATE TABLE cookies (name TEXT, value TEXT, domain TEXT);");
    this.db.exec("CREATE UNIQUE INDEX idx_cookies_domain_name ON cookies(domain, name);");
  }
  protected upgrade() { }

  delete(domain: string) {
    const st = this.db.prepare("DELETE FROM cookies WHERE domain=?;")
    st.run(domain);
    st.finalize();
  }

  get(domain: string): Cookie[] {
    const st = this.db.prepare("SELECT * FROM cookies WHERE domain=?;");
    const res = st.all(domain);
    st.finalize();
    return res;
  }

  set(domain: string, name: string, value: string) {
    const st = this.db.prepare(`
      INSERT INTO cookies (name, value, domain) VALUES (?, ?, ?) 
        ON CONFLICT(domain, name) DO UPDATE SET value = excluded.value;
    `);
    st.run(name, value, domain);
    st.finalize();
  }
}