import type { Comic } from "@puraty/server";

import { LazyImg } from "../LazyImg";
import api from "@/api";

import style from "./ComicItem.module.css";

export const ComicItem = ({
	comic,
	sourceId
}: {
	comic: Comic;
	sourceId: string;
}) => {
	return (
		<RouteLink
			href={`/comic/${sourceId}/manga/${encodeURIComponent(comic.id)}`}
			class={`${style.comicItemWrapper} clickable-item`}
		>
			<LazyImg
				class={style.comicItemImage}
				src={api.proxy(sourceId, comic.cover, comic.id)}
			/>
			<div class={style.comicItemMeta}>
				<div class={style.comicItemTitle}>{comic.title}</div>
				<div class={style.comicItemSubtitle}>
					{comic.subTitle ?? comic.subtitle}
				</div>
				<div class={style.comicItemSubtitle}>
					{[comic.description, comic.maxPage ? `${comic.maxPage} 页` : ""]
						.filter(v => !!v)
						.join(" - ")}
				</div>
				<div class={style.comicItemTagWrapper}>
					{comic.tags?.map((t, i) => (
						// Tags may be duplicate
						<div class={style.comicItemTag} key={i}>
							{t}
						</div>
					))}
				</div>
			</div>
		</RouteLink>
	);
};
