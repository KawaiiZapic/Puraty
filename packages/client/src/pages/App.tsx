import type { AppConfig, InstalledSourceDetail } from "@puraty/server";
import type { FunctionalComponent } from "preact";

import { TeleportWrapper } from "@/components/Modal/Teleport";
import { ConfigContext } from "@/context/config";
import { ComicSourcesContext } from "@/context/source";
import { RouterContext } from "@/router";
import type { Router } from "@/router/router";
import { RouteView } from "@/router/RouteView";

import { Header } from "./components/header";

export default (({ router, config: _config, sources }) => {
	const configState = useState(_config);
	const sourcesState = useState<Map<string, InstalledSourceDetail>>(
		new Map(sources.map(source => [source.key, source]))
	);
	return (
		<TeleportWrapper>
			<ConfigContext.Provider value={configState}>
				<ComicSourcesContext.Provider value={sourcesState}>
					<RouterContext.Provider value={router}>
						<Header />
						<RouteView />
					</RouterContext.Provider>
				</ComicSourcesContext.Provider>
			</ConfigContext.Provider>
		</TeleportWrapper>
	);
}) as FunctionalComponent<{
	router: Router;
	config: AppConfig;
	sources: InstalledSourceDetail[];
}>;
