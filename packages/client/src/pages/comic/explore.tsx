import type { Comic, ExplorePageResult } from "@puraty/server";

import { setTitle } from "../components/header";
import api from "@/api";
import { LazyImg } from "@/components/LazyImg";
import { router } from "@/router";
import { useSharedData } from "@/utils/SharedData";

import style from "./explore.module.css";

const ComicItem = ({ comic, sourceId }: { comic: Comic; sourceId: string }) => {
	return (
		<RouteLink
			href={`/comic/${sourceId}/manga/${encodeURIComponent(comic.id)}`}
		>
			<div class={[style.comicItemWrapper, "clickable-item"]}>
				<LazyImg
					class={style.comicItemImage}
					src={api.proxy(sourceId, comic.cover, comic.id)}
				></LazyImg>
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
						{comic.tags?.map(t => (
							<div class={style.comicItemTag}>{t}</div>
						))}
					</div>
				</div>
			</div>
		</RouteLink>
	);
};

export default () => {
	const route = router.current;
	const id = route?.params?.id;
	const explore = route?.params?.explore;
	const placeholder = document.createComment("");
	const bottom = <div class={style.comicListLastPlaceholder}>正在加载</div>;
	const root = (
		<div>
			{placeholder}
			{bottom}
		</div>
	);

	const shared = useSharedData(`comic-list-${id}-${explore}`, {
		results: [] as ExplorePageResult[],
		page: 0
	}).value;

	let isLoading = false;
	let isEnded = false;
	const io = new IntersectionObserver(
		entries => {
			if (!isLoading && !isEnded && entries[0].isIntersecting) {
				shared.page++;
				getData(shared.page);
			}
		},
		{
			rootMargin: "0px 0px 3000px 0px",
			threshold: 0
		}
	);
	io.observe(bottom as Element);

	const handleData = (detail: ExplorePageResult) => {
		if (!id || !explore) return;
		setTitle(detail.title);
		if (detail.type === "multiPageComicList") {
			detail.data.comics.forEach(comic => {
				placeholder.before(<ComicItem sourceId={id} comic={comic}></ComicItem>);
			});
		} else if (detail.type === "singlePageWithMultiPart") {
			Object.keys(detail.data).forEach(partId => {
				const partRoot = (
					<div>
						<div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">
							{partId}
						</div>
					</div>
				);
				detail.data[partId].forEach(comic => {
					partRoot.appendChild(
						<ComicItem sourceId={id} comic={comic}></ComicItem>
					);
				});
				placeholder.before(partRoot);
			});
		} else if (detail.type === "multiPartPage") {
			detail.data.forEach(part => {
				const partRoot = (
					<div>
						<div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">
							{part.title}
						</div>
					</div>
				);
				part.comics.forEach(comic => {
					partRoot.appendChild(
						<ComicItem sourceId={id} comic={comic}></ComicItem>
					);
				});
				placeholder.before(partRoot);
			});
		}
	};
	const isEnd = (detail: ExplorePageResult) => {
		if (detail.type === "multiPageComicList") {
			if (typeof detail.data.maxPage === "number") {
				return detail.data.maxPage >= shared.page;
			} else {
				const lastRecord = shared.results[shared.results.length - 1];
				if (!lastRecord) return false;
				return (
					lastRecord.type === "multiPageComicList" &&
					lastRecord.data.comics[0].id === detail.data.comics[0]?.id
				);
			}
		}
		return false;
	};
	const getData = async (page = 1) => {
		if (!id || !explore || isLoading) return;
		isLoading = true;
		try {
			let next: string | undefined = undefined;
			const last = shared.results[page - 2];
			if (last && last.type === "multiPageComicList") {
				next = last.data?.next;
			}
			const detail = await api.Comic.explore(id, explore, page, next);
			if (isEnd(detail)) {
				isEnded = true;
				bottom.textContent = "没有更多了";
				return;
			}
			handleData(detail);
			shared.results.push(detail);
		} catch {}
		isLoading = false;
	};
	(async () => {
		if (!id || !explore) return;
		if (shared.page !== 0) {
			shared.results.forEach(handleData);
			return;
		}
		shared.page = 1;
		getData(shared.page);
	})();
	return root;
};
