import { BaseDB } from "@/db/base";

import type {
	ComicCacheItem,
	ComicHistoryItem,
	ComicHistoryRecordBody
} from "./comic.model";

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
			"INSERT OR REPLACE INTO comic_cache (id, lastAccess, size, referenceCount) VALUES (?, ?, ?, ?);"
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

export class ComicHistory extends BaseDB {
	protected VERSION: number = 0;
	private static _instance: ComicHistory;

	private constructor() {
		super("comic_history");
	}

	static get db() {
		if (!this._instance) {
			this._instance = new ComicHistory();
		}
		return this._instance.db;
	}

	protected initialize(): void {
		this.db.exec(
			"CREATE TABLE comic_history (historyId INTEGER PRIMARY KEY AUTOINCREMENT, sourceId TEXT NOT NULL, comicId TEXT NOT NULL, title TEXT NOT NULL, subtitle TEXT, cover TEXT NOT NULL, description TEXT, maxPage INTEGER, lastReadAt INTEGER NOT NULL, UNIQUE(sourceId, comicId));"
		);
	}

	protected upgrade(): void {}

	static list(page: number, pageSize: number): ComicHistoryItem[] {
		const st = this.db.prepare(
			"SELECT * FROM comic_history ORDER BY lastReadAt DESC, historyId DESC LIMIT ? OFFSET ?;"
		);
		const res = st.all(pageSize, (page - 1) * pageSize);
		st.finalize();
		return res;
	}

	static count(): number {
		const st = this.db.prepare("SELECT COUNT(*) AS count FROM comic_history;");
		const count = st.all()[0].count;
		st.finalize();
		return count;
	}

	static record(item: ComicHistoryRecordBody): void {
		const st = this.db.prepare(
			"INSERT INTO comic_history (sourceId, comicId, title, subtitle, cover, description, maxPage, lastReadAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(sourceId, comicId) DO UPDATE SET title=excluded.title, subtitle=excluded.subtitle, cover=excluded.cover, description=excluded.description, maxPage=excluded.maxPage, lastReadAt=excluded.lastReadAt;"
		);
		st.run(
			item.sourceId,
			item.comicId,
			item.title,
			item.subtitle ?? null,
			item.cover,
			item.description ?? null,
			item.maxPage ?? null,
			Date.now()
		);
		st.finalize();
	}

	static delete(historyId: number): void {
		const st = this.db.prepare(
			"DELETE FROM comic_history WHERE historyId = ?;"
		);
		st.run(historyId);
		st.finalize();
	}

	static clear(): void {
		this.db.exec("DELETE FROM comic_history;");
	}
}
