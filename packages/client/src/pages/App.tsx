import type { FunctionComponent } from "preact";

import { RouterContext } from "@/router";
import type { Router } from "@/router/router";
import { RouteView } from "@/router/RouterView";

import Header from "./components/header";

export default (({ router }) => {
	return (
		<RouterContext.Provider value={router}>
			<Header />
			<RouteView />
		</RouterContext.Provider>
	);
}) as FunctionComponent<{ router: Router }>;
