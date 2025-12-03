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
			"CREATE TABLE source_data (key TEXT, id TEXT, type TEXT, value TEXT, PRIMARY KEY (key, id, type));"
		);
	}

	protected upgrade(): void {}

	static get<T = unknown>(
		type: DataType,
		id: string,
		key: string
	): T | undefined {
		const st = this.db.prepare(
			"SELECT value from source_data where key=? and id=? and type=?;"
		);
		const result = st.all(key, id, type)[0]?.value;
		st.finalize();
		return result ? JSON.parse(result) : undefined;
	}

	static getAll<T = Record<string, unknown>>(type: DataType, id: string): T {
		const st = this.db.prepare(
			"SELECT key,value from source_data where id=? and type=?;"
		);
		const result = st.all(id, type);
		st.finalize();
		const res: Record<string, unknown> = {};
		result.forEach(v => {
			res[v.key] = JSON.parse(v.value);
		});
		return res as T;
	}

	static set(type: DataType, id: string, key: string, data: unknown) {
		const st = this.db.prepare(
			"INSERT OR REPLACE INTO source_data (key, value, id, type) VALUES (?, ?, ?, ?);"
		);
		st.run(key, JSON.stringify(data), id, type);
		st.finalize();
	}

	static delete(type: DataType, id: string, key: string) {
		const st = this.db.prepare(
			"DELETE from source_data where key=? and id=? and type=?;"
		);
		st.run(key, id, type);
		st.finalize();
	}
}
