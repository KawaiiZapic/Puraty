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

export type ExplorePageResult =
	| _ExplorePageResult<MPPExplorePage>
	| _ExplorePageResult<MixedExplorePage>
	| _ExplorePageResult<MPCLExplorePage>
	| _ExplorePageResult<SPWMPExplorePage>;

export interface ComicCacheItem {
	id: string;
	lastAccess: number;
	size: number;
	referenceCount: number;
}
