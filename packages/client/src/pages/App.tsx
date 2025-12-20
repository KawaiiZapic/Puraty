import type { FunctionComponent } from "preact";

import { TeleportWrapper } from "@/components/Modal/Teleport";
import { RouterContext } from "@/router";
import type { Router } from "@/router/router";
import { RouteView } from "@/router/RouteView";

import Header from "./components/header";

export default (({ router }) => {
	return (
		<TeleportWrapper>
			<RouterContext.Provider value={router}>
				<Header />
				<RouteView />
			</RouterContext.Provider>
		</TeleportWrapper>
	);
}) as FunctionComponent<{ router: Router }>;
