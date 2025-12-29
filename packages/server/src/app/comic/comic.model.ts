import type {
	BaseExplorePage,
	MPPExplorePage,
	MixedExplorePage,
	MPCLExplorePage,
	SPWMPExplorePage
} from "@/venera-lib/Source";

type _ExplorePageResult<T extends BaseExplorePage> = {
	type: T["type"];
	data: Awaited<ReturnType<T["load"]>>;
	title: string;
};

type _MPCLExplorePageResult = {
	type: MPCLExplorePage["type"];
	data: Awaited<ReturnType<MPCLExplorePage["load"]>> & { next?: string };
	title: string;
};

export type ExplorePageResult =
	| _ExplorePageResult<MPPExplorePage>
	| _ExplorePageResult<MixedExplorePage>
	| _ExplorePageResult<SPWMPExplorePage>
	| _MPCLExplorePageResult;

export interface ComicCacheItem {
	id: string;
	lastAccess: number;
	size: number;
	referenceCount: number;
}

export interface ComicChapterResult {
	images: string[];
	hasImageLoadHook: boolean;
}
