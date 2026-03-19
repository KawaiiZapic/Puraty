import type { InstalledSourceDetail } from "@puraty/server";
import type { Dispatch, StateUpdater } from "preact/hooks";

import api from "@/api";

export const ComicSourcesContext = createContext<
	[
		Readonly<Map<string, InstalledSourceDetail>>,
		Dispatch<StateUpdater<Map<string, InstalledSourceDetail>>>
	]
>(null as never);

export const useComicSources = () => {
	const sources = useContext(ComicSourcesContext)[0];
	return useMemo(() => Array.from(sources.values()), [sources]);
};

export const useComicSource = (id: string) => {
	const sources = useContext(ComicSourcesContext)[0];
	return useMemo(() => sources.get(id), [id, sources]);
};

export const useComicSourcesRefresher = () => {
	const update = useContext(ComicSourcesContext)[1];
	return async () => {
		const sources = await api.ComicSource.list();
		const map = new Map(sources.map(source => [source.key, source]));
		update(map);
	};
};
