import type { Comic, ExplorePageResult } from "@puraty/server";

import { setTitle } from "../components/header";
import api from "@/api";
import { LazyImg } from "@/components/LazyImg";
import { useSharedData } from "@/utils/SharedData";

import style from "./explore.module.css";

const ComicItem = ({ comic, sourceId }: { comic: Comic; sourceId: string }) => {
	return (
		<RouteLink
			href={`/comic/${sourceId}/manga/${encodeURIComponent(comic.id)}`}
			class={`${style.comicItemWrapper} clickable-item`}
		>
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
		</RouteLink>
	);
};

export default () => {
	const route = useRoute();
	const id = route?.params?.id;
	const explore = route?.params?.explore;

	const shared = useSharedData(`explore-${id}-${explore}`, {
		page: 0,
		results: [] as ExplorePageResult[]
	});

	const [results, setResults] = useState<ExplorePageResult[]>([]);
	const [isEnded, setIsEnded] = useState(false);
	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isLoading = false;
		const { results } = shared.value;

		const isEnd = (detail: ExplorePageResult) => {
			const page = shared.value.page;
			if (detail.type === "multiPageComicList") {
				if (typeof detail.data.maxPage === "number") {
					return detail.data.maxPage <= page;
				} else {
					const lastRecord = results[results.length - 1];
					if (!lastRecord) return false;
					return (
						lastRecord.type === "multiPageComicList" &&
						lastRecord.data.comics[0].id === detail.data.comics[0]?.id
					);
				}
			}
			return false;
		};

		const fetchData = async (newPage: number) => {
			if (!id || !explore || isLoading) return;

			isLoading = true;
			try {
				let next: string | undefined = undefined;
				const last = results[newPage - 2];
				if (last && last.type === "multiPageComicList") {
					next = last.data?.next;
				}

				const detail = await api.Comic.explore(id, explore, newPage, next);

				if (isEnd(detail)) {
					setIsEnded(true);
					isLoading = false;
					return;
				}

				results.push(detail);
				shared.value.page = newPage;
				setResults(prev => [...prev, detail]);
				setTitle(detail.title);
			} catch (e) {
				console.error(e);
			}
			isLoading = false;
		};
		const observer = new IntersectionObserver(
			entries => {
				if (!isLoading && !isEnded && entries[0].isIntersecting) {
					const page = shared.value.page;
					fetchData(page + 1);
				}
			},
			{
				rootMargin: "0px 0px 3000px 0px",
				threshold: 0
			}
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, []);

	const renderContent = () => {
		return results.map(result => {
			if (result.type === "multiPageComicList") {
				return result.data.comics.map(comic => (
					<ComicItem key={comic.id} sourceId={id!} comic={comic} />
				));
			} else if (result.type === "singlePageWithMultiPart") {
				return Object.keys(result.data).map(partId => (
					<div key={partId}>
						<div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">
							{partId}
						</div>
						{result.data[partId].map(comic => (
							<ComicItem key={comic.id} sourceId={id!} comic={comic} />
						))}
					</div>
				));
			} else if (result.type === "multiPartPage") {
				return result.data.map(part => (
					<div key={part.title}>
						<div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">
							{part.title}
						</div>
						{part.comics.map(comic => (
							<ComicItem key={comic.id} sourceId={id!} comic={comic} />
						))}
					</div>
				));
			}
			return null;
		});
	};

	return (
		<div>
			{renderContent()}
			<div ref={observerTarget} class={style.comicListLastPlaceholder}>
				{isEnded ? "没有更多了" : "正在加载"}
			</div>
		</div>
	);
};
