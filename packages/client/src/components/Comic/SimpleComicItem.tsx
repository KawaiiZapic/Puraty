import type { Comic } from "@puraty/server";

import { LazyImg } from "../LazyImg";
import api from "@/api";

import style from "./ComicItem.module.css";

export const SimpleComicItem = ({
	comic,
	sourceId,
	class: className
}: {
	comic: Comic;
	sourceId: string;
	class?: string;
}) => {
	return (
		<RouteLink
			href={`/comic/${sourceId}/manga/${encodeURIComponent(comic.id)}`}
			class={"clickable-item flex items-center flex-col " + (className ?? "")}
		>
			<LazyImg
				class={`${style.comicItemImage} mr-0!`}
				src={api.proxy(sourceId, comic.cover, comic.id)}
			/>
			<div class={`line-clamp-2 text-xs! text-center px-1`}>{comic.title}</div>
		</RouteLink>
	);
};
