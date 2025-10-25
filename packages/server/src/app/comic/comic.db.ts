import { BaseDB } from "@/db/base";

import type { ComicCacheItem } from "./comic.model";

export class ComicCache extends BaseDB {
	protected VERSION: number = 0;
	private static _instance: ComicCache;

	private constructor() {
		super("comic_cache");
	}

	static get db() {
		if (!this._instance) {
			this._instance = new ComicCache();
		}
		return this._instance.db;
	}

	protected initialize(): void {
		this.db.exec(
			"CREATE TABLE comic_cache (id TEXT PRIMARY KEY, lastAccess INTEGER, size INTEGER, referenceCount INTEGER);"
		);
	}

	protected upgrade(): void {}

	static list(): ComicCacheItem[] {
		const st = this.db.prepare("SELECT * from comic_cache;");
		const res = st.all();

		st.finalize();
		return res;
	}

	static access(id: string): void {
		const st = this.db.prepare(
			"UPDATE comic_cache SET lastAccess = ? WHERE id = ?;"
		);
		st.run(Date.now(), id);
		st.finalize();
	}

	static delete(id: string): void {
		const st = this.db.prepare("DELETE FROM comic_cache WHERE id = ?;");
		st.run(id);
		st.finalize();
	}

	static count(): number {
		const st = this.db.prepare("SELECT COUNT(*) as count FROM comic_cache;");
		const res = st.all()[0].count;
		st.finalize();
		return res;
	}

	static totalSize(): number {
		const st = this.db.prepare("SELECT SUM(size) as sum FROM comic_cache;");
		const res = st.all()[0].sum ?? 0;
		st.finalize();
		return res;
	}

	static betweenDate(end: number, start = 0): ComicCacheItem[] {
		const st = this.db.prepare(
			"SELECT * FROM comic_cache WHERE lastAccess BETWEEN ? AND ?;"
		);
		const res = st.all(start, end);
		st.finalize();
		return res;
	}

	static sizeBetweenDate(end: number, start = 0): number {
		const st = this.db.prepare(
			"SELECT SUM(size) as sum FROM comic_cache WHERE lastAccess BETWEEN ? AND ?;"
		);
		const res = st.all(start, end)[0].sum ?? 0;
		st.finalize();
		return res;
	}

	static insert(id: string, size: number): void {
		const st = this.db.prepare(
			"INSERT INTO comic_cache (id, lastAccess, size, referenceCount) VALUES (?, ?, ?, ?);"
		);
		st.run(id, Date.now(), size, 0);
		st.finalize();
	}

	static addReference(id: string): void {
		const st = this.db.prepare(
			"UPDATE comic_cache SET referenceCount = referenceCount + 1 WHERE id = ?;"
		);
		st.run(id);
		st.finalize();
	}

	static removeReference(id: string): void {
		const st = this.db.prepare(
			"UPDATE comic_cache SET referenceCount = referenceCount - 1 WHERE id = ?;"
		);
		st.run(id);
		st.finalize();
	}
}
