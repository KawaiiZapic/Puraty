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
};

export type ExplorePageResult =
	| _ExplorePageResult<MPPExplorePage>
	| _ExplorePageResult<MixedExplorePage>
	| _ExplorePageResult<MPCLExplorePage>
	| _ExplorePageResult<SPWMPExplorePage>;
