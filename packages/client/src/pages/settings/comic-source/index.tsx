import api from "@/api";
import LoadingWrapper from "@/components/LoadingWrapper";

import SourceItem from "./components/source-item";

export interface ListSourceDetail {
	name: string;
	key: string;
	version?: string;
	description?: string;
	fileName?: string;
	initialized?: boolean;
	installedVersion?: string;
}

const ComicSourcePage = () => {
	const [isLoading, setLoading] = useState(true);
	const [installed, setInstalled] = useState<ListSourceDetail[]>([]);
	const [available, setAvailable] = useState<ListSourceDetail[]>([]);
	const load = useCallback(async () => {
		setLoading(true);
		try {
			const _installed = (await api.ComicSource.list(true)).map(v => {
				return {
					name: v.name,
					key: v.key,
					installedVersion: v.version
				};
			});
			setInstalled(_installed);
			const _available = await api.ComicSource.available();
			setAvailable(
				_available.filter(it => {
					const idx = _installed.findIndex(it2 => it2.key === it.key);
					if (idx > -1) {
						_installed[idx] = {
							...it,
							installedVersion: _installed[idx].installedVersion
						};
					}
					return idx < 0;
				})
			);
		} catch (_) {
			console.error(_);
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => void load(), []);
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
