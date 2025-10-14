import { BaseDB } from "@/db/base";

export interface SourceDetail {
	key: string;
	version: string;
}

export type DataType = "setting" | "data";

export class InstalledSource extends BaseDB {
	protected VERSION: number = 0;
	private static _instance: InstalledSource;

	private constructor() {
		super("installed_source");
	}

	static get db() {
		if (!this._instance) {
			this._instance = new InstalledSource();
		}
		return this._instance.db;
	}

	protected initialize(): void {
		this.db.exec(
			"CREATE TABLE installed_source (key TEXT PRIMARY KEY, version TEXT);"
		);
	}

	protected upgrade(): void {}

	static list(): Record<string, string> {
		const st = this.db.prepare("SELECT * from installed_source;");
		const res: Record<string, string> = {};
		st.all().forEach(v => {
			res[v.key] = v.version;
		});
		st.finalize();
		return res;
	}

	static get(name: string): SourceDetail | undefined {
		const st = this.db.prepare("SELECT * from installed_source where key=?;");
		const result = st.all(name)[0];
		st.finalize();
		return result;
	}

	static install(key: string, version: string) {
		const st = this.db.prepare(
			"INSERT OR REPLACE INTO installed_source (key, version) VALUES (?, ?);"
		);
		st.run(key, version);
		st.finalize();
	}

	static delete(name: string) {
		const st = this.db.prepare("DELETE from installed_source where key=?;");
		st.run(name);
		st.finalize();
	}
}

export class ComicSourceData extends BaseDB {
	protected VERSION: number = 0;
	private static _instance: ComicSourceData;

	private constructor() {
		super("comic_source_data");
	}

	static get db() {
		if (!this._instance) {
			this._instance = new ComicSourceData();
		}
		return this._instance.db;
	}

	protected initialize(): void {
		this.db.exec(
			"CREATE TABLE source_data (key TEXT PRIMARY KEY, value TEXT);"
		);
	}

	protected upgrade(): void {}

	static get(type: DataType, id: string, name: string): string {
		const st = this.db.prepare("SELECT value from source_data where key=?;");
		const result = st.all(`${type}_${id}_${name}`)[0]?.value;
		st.finalize();
		return result;
	}

	static getAll(type: DataType, id: string): { key: string; value: string }[] {
		const st = this.db.prepare(
			"SELECT key,value from source_data where key like ? escape '\\'"
		);
		const result = st.all(`${type}\\_${id.replaceAll("_", "\\_")}\\_%`);
		st.finalize();
		return result;
	}

	static set(type: DataType, id: string, name: string, data: string) {
		const st = this.db.prepare(
			"INSERT OR REPLACE INTO source_data (key, value) VALUES (?, ?);"
		);
		st.run(`${type}_${id}_${name}`, data);
		st.finalize();
	}

	static delete(type: DataType, id: string, name: string) {
		const st = this.db.prepare("DELETE from source_data where key=?;");
		st.run(`${type}_${id}_${name}`);
		st.finalize();
	}
}
