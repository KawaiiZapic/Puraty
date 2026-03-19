import api from "@/api";
import LoadingWrapper from "@/components/LoadingWrapper";
import { useComicSources, useComicSourcesRefresher } from "@/context/source";
import { useSharedData } from "@/utils/SharedData";

import SourceItem from "./components/source-item";

export interface ListSourceDetail {
	name: string;
	key: string;
	version?: string;
	description?: string;
	fileName?: string;
	initialized?: boolean;
	installedVersion?: string;
	incompatible?: boolean;
}

const ComicSourcePage = () => {
	const sharedAvailable = useSharedData<ListSourceDetail[]>(
		"available-sources",
		[]
	);
	const installedSources = useComicSources();
	const refreshSource = useComicSourcesRefresher();

	const [isLoading, setLoading] = useState(true);
	const [available, setAvailable] = useState<ListSourceDetail[]>([]);
	const [installed, setInstalled] = useState<ListSourceDetail[]>([]);
	const load = useCallback(async () => {
		setLoading(true);
		try {
			const _installed = installedSources.map(v => {
				return {
					name: v.name,
					key: v.key,
					installedVersion: v.version,
					incompatible: v.incompatible
				};
			});
			const _available =
				sharedAvailable.value.length > 0
					? sharedAvailable.value
					: await api.ComicSource.available();
			sharedAvailable.value = _available;
			setAvailable(
				_available.filter(it => {
					const idx = _installed.findIndex(it2 => it2.key === it.key);
					if (idx > -1) {
						_installed[idx] = {
							...it,
							incompatible: _installed[idx].incompatible,
							installedVersion: _installed[idx].installedVersion
						};
					}
					return idx < 0;
				})
			);
			setInstalled(_installed);
		} catch (_) {
			console.error(_);
		} finally {
			setLoading(false);
		}
	}, [installedSources]);
	useEffect(() => void load(), [installedSources]);
	useEffect(() => {
		return () => {
			refreshSource();
		};
	}, []);
	return (
		<>
			{installed.map(source => (
				<SourceItem item={source} key={source.key} />
			))}
			<LoadingWrapper loading={isLoading} onRetry={load}>
				{available.map(source => (
					<SourceItem item={source} key={source.key} />
				))}
			</LoadingWrapper>
		</>
	);
};

export default ComicSourcePage;
