import type { Comic, PageJumpTarget } from "@puraty/server";

import { ComicItem } from "@/components/Comic/ComicItem";

export const MultiPartListItem = ({
	partId,
	comics,
	viewMore,
	provider
}: {
	partId: string;
	comics: Comic[];
	viewMore?: PageJumpTarget;
	provider: string;
}) => {
	return (
		<div key={partId}>
			<div class="px-3 py-2 flex items-center">
				<span class="flex-grow-1 text-xl">{partId}</span>
				{If(viewMore)(<div class="clickable-item p-1">查看更多</div>).End()}
			</div>
			<div class="px-3">
				{comics.map(comic => (
					<ComicItem key={comic.id} sourceId={provider} comic={comic} />
				))}
			</div>
		</div>
	);
};
