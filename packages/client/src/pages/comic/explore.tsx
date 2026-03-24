import type { ExplorePageResult } from "@puraty/server";

import { useTitleSetter } from "../components/header";
import api from "@/api";
import { SimpleList } from "@/components/Comic/SimpleList";
import LoadingWrapper from "@/components/LoadingWrapper";
import { useSharedData } from "@/utils/SharedData";

import { MultiPartListItem } from "./components/MultiPartListItem";
import style from "./explore.module.css";

const ExplorePage = () => {
	const route = useRoute();
	const provider = route?.params?.provider;
	const explore = route?.params?.explore;
	const setTitle = useTitleSetter();

	const shared = useSharedData(`explore-${provider}-${explore}`, {
		page: 0,
		isEnded: false,
		results: [] as ExplorePageResult[]
	});

	const [results, setResults] = useState<ExplorePageResult[]>(
		shared.value.results
	);
	const [isEnded, setIsEnded] = useState(shared.value.isEnded);
	const [errorMsg, setErrorMsg] = useState("");
	const observerTarget = useRef<HTMLDivElement>(null);

	const observer = useMemo(() => {
		return new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					fetchNext();
				}
			},
			{
				rootMargin: `0px 0px ${screen.availHeight * 1.5}px 0px`,
				threshold: 0
			}
		);
	}, []);

	const fetchNext = useMemo(() => {
		let isLoading = false;
		let isObserved = false;
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
			} else if (detail.type === "singlePageWithMultiPart" && page !== 0) {
				return true;
			}
			return false;
		};

		return async () => {
			if (!provider || !explore || isLoading || isEnded) return;

			const page = shared.value.page;

			isLoading = true;
			setErrorMsg("");
			try {
				let next: string | undefined = undefined;
				const last = results[page - 1];
				if (last && last.type === "multiPageComicList") {
					next = last.data?.next;
				}

				const detail = await api.Comic.explore(
					provider,
					explore,
					page + 1,
					next
				);

				if (isEnd(detail)) {
					setIsEnded(true);
					shared.value.isEnded = true;
					return;
				}

				results.push(detail);
				shared.value.page = page + 1;
				setResults([...results]);
				setTitle(detail.title);
				if (!isObserved && observerTarget.current) {
					observer.observe(observerTarget.current);
					isObserved = true;
				}
			} catch (e) {
				console.error(e);
				setErrorMsg("加载失败");
			} finally {
				isLoading = false;
			}
		};
	}, []);

	useEffect(() => {
		setTitle(results[0]?.title ?? "");
		if (isEnded) return;
		if (shared.value.page === 0) {
			fetchNext();
		} else if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [isEnded]);

	const renderContent = () => {
		return results.map((result, i) => {
			if (result.type === "multiPageComicList") {
				return (
					<SimpleList
						provider={provider!}
						comics={result.data.comics}
						key={i}
					/>
				);
			} else if (result.type === "singlePageWithMultiPart") {
				return Object.keys(result.data).map((partId, j) => (
					<MultiPartListItem
						partId={partId}
						provider={provider!}
						comics={result.data[partId]}
						key={j}
					/>
				));
			} else if (result.type === "multiPartPage") {
				return result.data.map(part => (
					<MultiPartListItem
						partId={part.title}
						provider={provider!}
						comics={part.comics}
						viewMore={part.viewMore}
						key={i}
					/>
				));
			} else if (result.type === "mixed") {
				return result.data.data.map((part, j) => {
					if (Array.isArray(part)) {
						return <SimpleList provider={provider!} comics={part} key={j} />;
					} else {
						return (
							<MultiPartListItem
								partId={part.title}
								provider={provider!}
								comics={part.comics}
								viewMore={part.viewMore}
								key={j}
							/>
						);
					}
				});
			} else {
				// @ts-expect-error Unknown explore page type
				throw new Error(`Unknown explore page type: ${result.type}`);
			}
		});
	};

	return (
		<div>
			{renderContent()}
			<div ref={observerTarget} class={style.comicListLastPlaceholder}>
				{isEnded ? (
					"没有更多了"
				) : (
					<LoadingWrapper
						style={""}
						loading={errorMsg === ""}
						errorMsg={errorMsg}
						onRetry={fetchNext}
					/>
				)}
			</div>
		</div>
	);
};

export default ExplorePage;
