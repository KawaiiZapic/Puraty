import type { ComicSearchResult } from "@puraty/server";

import api from "@/api";
import { SimpleList } from "@/components/Comic/SimpleList";
import { useSharedData } from "@/utils/SharedData";

const SearchResultPage = () => {
	const route = useRoute()!;
	const provider = route.params.provider;
	const query = route.query.q;
	const shared = useSharedData(`search-${provider}-${query}`, {
		page: 0,
		isEnded: false,
		results: [] as ComicSearchResult[]
	});
	const [results, setResults] = useState<ComicSearchResult[]>(
		shared.value.results
	);
	useEffect(() => {
		if (!query) {
			return;
		}
		api.Comic.search(provider, query).then(res => {
			shared.value.results = [res];
			setResults(shared.value.results);
		});
	}, [provider, query]);
	return (
		<div>
			{results[0] && (
				<SimpleList comics={results[0].comics} provider={provider} />
			)}
		</div>
	);
};

export default SearchResultPage;
