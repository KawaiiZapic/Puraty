import {
	createContext,
	Fragment,
	h,
	type ComponentType,
	type FunctionComponent
} from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { useRouter } from ".";

const RouteViewIndex = createContext(0);

export const RouteView: FunctionComponent = () => {
	const [currentRoute, setCurrent] = useState<ComponentType[]>([]);
	const routeLevel = useContext(RouteViewIndex);
	const router = useRouter();
	useEffect(() => {
		setCurrent([router.matched[routeLevel].component]);
		return router.beforeEnter(() => {
			const newEl = router.matched[routeLevel].component;
			if (newEl !== currentRoute[0]) {
				setCurrent([newEl]);
			}
		});
	}, []);
	return (
		<RouteViewIndex.Provider value={routeLevel + 1}>
			{h(currentRoute[0] ?? Fragment, null)}
		</RouteViewIndex.Provider>
	);
};
