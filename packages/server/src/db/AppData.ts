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

	protected upgrade(): void {}

	static get<T>(name: string): T | undefined {
		const st = this.db.prepare("SELECT value from app_data where key=?;");
		const result = st.all(name)[0]?.value;
		st.finalize();
		return result ? JSON.parse(result) : undefined;
	}

	static getAll<T = Record<string, unknown>>(): T {
		const st = this.db.prepare("SELECT key,value from app_data;");
		const result = st.all();
		st.finalize();
		const res: Record<string, unknown> = {};
		result.forEach(v => {
			res[v.key] = JSON.parse(v.value);
		});
		return res as T;
	}

	static set(name: string, data: unknown) {
		const st = this.db.prepare(
			"INSERT OR REPLACE INTO app_data (key, value) VALUES (?, ?);"
		);
		st.run(name, JSON.stringify(data));
		st.finalize();
	}

	static delete(name: string) {
		const st = this.db.prepare("DELETE from app_data where key=?;");
		st.run(name);
		st.finalize();
	}
}
