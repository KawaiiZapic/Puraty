import type { AppConfig } from "@puraty/server";
import type { FunctionalComponent } from "preact";

import { TeleportWrapper } from "@/components/Modal/Teleport";
import { ConfigContext } from "@/context/config";
import { RouterContext } from "@/router";
import type { Router } from "@/router/router";
import { RouteView } from "@/router/RouteView";

import { Header } from "./components/header";

export default (({ router, config: _config }) => {
	const configState = useState(_config);
	return (
		<TeleportWrapper>
			<ConfigContext.Provider value={configState}>
				<RouterContext.Provider value={router}>
					<Header />
					<RouteView />
				</RouterContext.Provider>
			</ConfigContext.Provider>
		</TeleportWrapper>
	);
}) as FunctionalComponent<{ router: Router; config: AppConfig }>;
