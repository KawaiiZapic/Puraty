import type { Comic } from "@puraty/server";

import { ComicItem } from "./ComicItem";

export const SimpleList = ({
	provider,
	comics
}: {
	provider: string;
	comics: Comic[];
}) => {
	return comics.map(comic => (
		<ComicItem key={comic.id} sourceId={provider} comic={comic} />
	));
};
