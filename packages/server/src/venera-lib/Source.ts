import { ComicSourceData } from "@/app/comic-source/comic-source.db";

import { APP } from "./App";
import type { Comic, ComicDetails, ImageLoadingConfig } from "./Data";

interface AccountLogin {
	login?: (account: string, pwd: string) => Promise<unknown>;
	loginWithWebview?: {
		url: string;
		checkStatus(url: string, title: string): boolean;
		onLoginSuccess(): void;
	};
	loginWithCookies?: {
		fields: string[];
		validate: (values: string[]) => Promise<boolean>;
	};
	logout?: () => void;
	registerWebsite?: string;
}

export interface PageJumpTarget {
	page: "category" | "search";
	attributes: Record<string, string>;
}

export interface BaseExplorePage {
	type: string;
	title: string;
	load(page: number | null): Promise<unknown>;
}

export interface MPPExplorePage extends BaseExplorePage {
	type: "multiPartPage";
	load(
		page: number | null
	): Promise<{ title: string; comics: Comic[]; viewMore: PageJumpTarget }[]>;
}

export interface MPCLExplorePage extends BaseExplorePage {
	type: "multiPageComicList";
	load(page: number | null): Promise<{ comics: Comic[]; maxPage: number }>;
	loadNext?: (next: unknown) => Promise<{ comics: Comic[]; next?: string }>;
}

export interface MixedExplorePage extends BaseExplorePage {
	type: "mixed";
	load(page: number | null): Promise<{
		data: (Comic[] | { title: string; comics: Comic[]; viewMore?: string })[];
		maxPage: number;
	}>;
}

export interface SPWMPExplorePage extends BaseExplorePage {
	type: "singlePageWithMultiPart";
	load(): Promise<Record<string, Comic[]>>;
}

export type AnyExplorePage =
	| MPPExplorePage
	| MPCLExplorePage
	| MixedExplorePage
	| SPWMPExplorePage;

interface SearchOptionItem {
	type?: "select" | "multi-select" | "dropdown";
	options: string[];
	label: string;
	default?: string;
}

interface SearchOptions {
	enableTagsSuggestions: boolean;
	optionList: SearchOptionItem[];
	load(
		keyword: string,
		options: string[],
		page: number
	): Promise<{ comics: Comic[]; maxPage: number }>;
	loadNext(
		keyword: string,
		options: string[],
		next: string | null
	): Promise<{ comics: Comic[]; maxPage: number }>;
}

interface SelectSettingItem {
	type: "select";
	title: string;
	options?: { text?: string; value: string }[];
	default?: string;
}

interface SwitchSettingItem {
	type: "switch";
	title: string;
	default?: boolean;
}

interface InputSettingItem {
	type: "input";
	title: string;
	validator: null | string;
	default?: string;
}

interface CallbackSettingItem {
	type: "callback";
	title: string;
	buttonText: string;
	callback(): void | Promise<void>;
}

export type AnySettingItem =
	| SelectSettingItem
	| SwitchSettingItem
	| InputSettingItem
	| CallbackSettingItem;

interface ComicLoader {
	loadInfo(id: string): Promise<ComicDetails>;
	loadThumbnails?(
		id: string,
		next: string | null
	): Promise<{ thumbnails: string[]; next?: string }>;
	starRating?(id: string, rating: number): Promise<unknown>;
	loadEp(comicId: string, epId?: string): Promise<{ images: string[] }>;
	onImageLoad?(
		url: string,
		comicId: string,
		epId?: string
	): Promise<ImageLoadingConfig>;
	onThumbnailLoad?(url: string): Promise<ImageLoadingConfig>;
	likeComic?(id: string, isLike: boolean): Promise<unknown>;
	loadComments?(
		comicId: string,
		subId: string | null,
		page: number,
		replyTo?: string
	): Promise<{ comments: Comment[]; maxPage?: number }>;
	sendComment?(
		comicId: string,
		subId: string | null,
		content: string,
		replyTo?: string
	): Promise<unknown>;
	likeComment?(
		comicId: string,
		subId: string | null,
		commentId: string,
		isLike: boolean
	): Promise<unknown>;
	voteComment?(
		comicId: string,
		subId: string | null,
		commentId: string,
		isUp: boolean,
		isCancel: boolean
	): Promise<unknown>;
	idMatch?: string;
	onClickTag?(namespace: string, tag: string): PageJumpTarget;
	link?: {
		domains: string[];
		linkToId(url: string): string | null;
	};
	enableTagsTranslate?: boolean;
}

export abstract class ComicSource {
	public name = "";
	public key = "";
	public version = "";
	public minAppVersion = "";
	public url = "";
	public initializeError = "";
	public settings?: Record<string, AnySettingItem>;
	public account?: AccountLogin;
	public explore?: AnyExplorePage[];
	public search?: SearchOptions;
	public comic: ComicLoader = {
		loadInfo() {
			throw new Error("Not implemented");
		},
		loadEp() {
			throw new Error("Not implemented");
		}
	};

	loadData(dataKey: string): string | undefined {
		return ComicSourceData.get("data", this.key, dataKey);
	}

	loadSetting(key: string): string | undefined {
		return (
			ComicSourceData.get("setting", this.key, key) ??
			(this.settings?.[key] as InputSettingItem)?.default
		);
	}

	saveData(dataKey: string, data: string) {
		ComicSourceData.set("data", this.key, dataKey, data);
	}

	deleteData(dataKey: string) {
		ComicSourceData.delete("data", this.key, dataKey);
	}

	get isLogged(): boolean {
		return !!ComicSourceData.get("data", this.key, "account");
	}

	translation: Record<string, Record<string, string>> = {};

	translate(key: string): string {
		const locale = APP.locale;
		return this.translation[locale]?.[key] ?? key;
	}

	init(): Promise<void> | void {}

	static sources = {};
}
