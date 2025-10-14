import path from "tjs:path";
import { Database } from "tjs:sqlite";

export abstract class BaseDB {
	private static _db: Database;
	protected VERSION = 0;

	constructor(name: string) {
		const db = this.db;
		db.exec(
			"CREATE TABLE IF NOT EXISTS puraty_db_meta (name TEXT PRIMARY KEY, version TEXT)"
		);
		try {
			const version = db
				.prepare("SELECT version FROM puraty_db_meta WHERE name=?")
				.all(name)[0]?.version;
			if (typeof version !== "string") {
				throw new Error("Initialize required");
			} else if (version !== this.VERSION.toString()) {
				this.upgrade();
				db.prepare("UPDATE puraty_db_meta SET version=? WHERE name=?").run(
					this.VERSION,
					name
				);
			}
		} catch (_) {
			db.prepare(
				"INSERT INTO puraty_db_meta (name, version) VALUES (?, ?)"
			).run(name, this.VERSION);
			this.initialize();
		}
	}

	protected get db() {
		if (!BaseDB._db) {
			const db = new Database(path.join(APP_DIR, "data.db"), {
				readOnly: false,
				create: true
			});
			BaseDB._db = db;
		}
		return BaseDB._db;
	}

	protected abstract initialize(): void;
	protected abstract upgrade(): void;
}
