import type { ComicSearchResult } from "@puraty/server";

import api from "@/api";
import { SimpleList } from "@/components/Comic/SimpleList";
import LoadingWrapper from "@/components/LoadingWrapper";
import { useSharedData } from "@/utils/SharedData";

const SearchResultPage = () => {
	const route = useRoute();
	const provider = route?.params?.provider;
	const query = route?.query?.q;

	const shared = useSharedData(`search-${provider}-${query}`, {
		page: 0,
		isEnded: false,
		results: [] as ComicSearchResult[]
	});

	const [results, setResults] = useState<ComicSearchResult[]>(
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

		const isEnd = (detail: ComicSearchResult) => {
			const page = shared.value.page;
			if (typeof detail.maxPage === "number" && page >= detail.maxPage)
				return true;
			if (detail.comics.length === 0) return true;
			// TODO: loadNext end handler
			return false;
		};

		return async () => {
			if (!provider || isLoading || isEnded) return;

			const page = shared.value.page;

			isLoading = true;
			setErrorMsg("");
			try {
				let next: string | undefined = undefined;
				const last = results[page - 1];
				if (last && last.next) {
					next = last.next;
				}
				const detail = await api.Comic.search(provider, query!, page + 1, next);

				if (isEnd(detail)) {
					setIsEnded(true);
					shared.value.isEnded = true;
					return;
				}

				results.push(detail);
				shared.value.page = page + 1;
				setResults([...results]);
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
			return <SimpleList provider={provider!} comics={result.comics} key={i} />;
		});
	};

	return (
		<div>
			{renderContent()}
			<div ref={observerTarget} class="p-12 text-center">
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

export default SearchResultPage;
