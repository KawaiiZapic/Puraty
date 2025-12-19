import { createContext, Fragment, h, type FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import type { RouteRecord } from "./router";

import { useRouter } from ".";

const RouteViewIndex = createContext(0);

export const RouteView: FunctionComponent = () => {
	const [currentRoute, setCurrent] = useState<RouteRecord>();
	const routeLevel = useContext(RouteViewIndex);
	const router = useRouter();
	useEffect(() => {
		setCurrent(router.matched[routeLevel]);
		return router.beforeEnter(() => {
			const newEl = router.matched[routeLevel];
			if (newEl !== currentRoute) {
				setCurrent(newEl);
			}
		});
	}, []);
	return (
		<RouteViewIndex.Provider value={routeLevel + 1}>
			{h(currentRoute?.component ?? Fragment, null)}
		</RouteViewIndex.Provider>
	);
};
