import type { ComponentType, FunctionalComponent } from "preact";

const RouteViewIndex = createContext(0);

export const RouteView: FunctionalComponent = () => {
	const routeLevel = useContext(RouteViewIndex);
	const router = useRouter();
	const [currentRoute, setCurrent] = useState<ComponentType[]>([
		router.matched[routeLevel].component
	]);
	useEffect(() => {
		return router.beforeEnter(() => {
			const newEl = router.matched[routeLevel].component;
			setCurrent(prev => {
				if (prev[0] !== newEl) {
					return [newEl];
				} else {
					return prev;
				}
			});
		});
	}, []);
	return (
		<RouteViewIndex.Provider value={routeLevel + 1}>
			{h(currentRoute[0] ?? Fragment, null)}
		</RouteViewIndex.Provider>
	);
};
