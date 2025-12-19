import Navigo, { type Match, type RouterOptions } from "navigo";
import type { ComponentType } from "preact";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface RouteMeta {}
}

export interface RouteRecord {
	path: string;
	component: ComponentType;
	name?: string;
	title?: string;
	children?: RouteRecord[];
	meta?: Partial<RouteMeta>;
}

export interface RegisteredRouteRecord extends RouteRecord {
	parents: RegisteredRouteRecord[];
}

export interface MatchedRouteRecord extends RouteRecord {
	query: Record<string, string>;
	params: Record<string, string>;
}

export type RouteHookHandler = (
	to: MatchedRouteRecord,
	from: MatchedRouteRecord | null
) => void | Promise<void>;
export type RouteNotFoundHandler = () => void | Promise<void>;

export interface __Router {
	__router: Navigo;
	__originalMatch: Match | null;
	current: Readonly<MatchedRouteRecord> | null;
	matched: Readonly<Readonly<RouteRecord>[]>;
	beforeEnter: (hook: RouteHookHandler) => () => void;
	onEnter: (hook: RouteHookHandler) => () => void;
	onLeave: (hook: RouteHookHandler) => () => void;
	onUpdate: (hook: RouteHookHandler) => () => void;
	onNotFound: (hook: RouteNotFoundHandler) => () => void;
	navigate: Navigo["navigate"];
	with(fn: RouterPlugin): Router;
	ready(): void;
}

export type RouterPlugin = (router: Router) => void;

export type Router = Readonly<__Router>;

export const createRouter = (
	routes: RouteRecord[],
	options?: RouterOptions & { base?: string }
) => {
	const __router = new Navigo(options?.base ?? "/", options);
	const binding = new WeakMap<
		(...args: never[]) => void,
		RegisteredRouteRecord
	>();

	const hooks = {
		before: [] as RouteHookHandler[],
		after: [] as RouteHookHandler[],
		leave: [] as RouteHookHandler[],
		update: [] as RouteHookHandler[],
		notFound: [] as RouteNotFoundHandler[]
	};

	const bindLifeCycleHook = <T extends keyof typeof hooks>(
		type: T,
		fn: (typeof hooks)[T][number]
	) => {
		hooks[type].push(fn as never);
		return () => {
			hooks[type].splice(hooks.before.indexOf(fn as never), 1);
		};
	};

	const previousRoute: Pick<__Router, "current" | "matched"> = {
		current: null,
		matched: []
	};

	const router: __Router = {
		__router,
		__originalMatch: null,
		current: null,
		matched: [],
		beforeEnter(hook) {
			return bindLifeCycleHook("before", hook);
		},
		onEnter(hook) {
			return bindLifeCycleHook("after", hook);
		},
		onLeave(hook) {
			return bindLifeCycleHook("leave", hook);
		},
		onUpdate(hook) {
			return bindLifeCycleHook("update", hook);
		},
		onNotFound(hook) {
			return bindLifeCycleHook("notFound", hook);
		},
		navigate(to, opt) {
			history.pushState(null, "");
			history.replaceState(
				{
					historyIndex: history.length - 1
				},
				""
			);
			__router.navigate(to, {
				...opt,
				historyAPIMethod: "replaceState",
				stateObj: history.state
			});
		},
		with(fn: RouterPlugin) {
			fn(router);
			return router;
		},
		ready() {
			history.replaceState(
				{
					historyIndex: history.length - 1
				},
				""
			);
			__router.resolve();
		}
	};

	const applyHooks = async (
		type: keyof typeof hooks,
		match: MatchedRouteRecord,
		prev: MatchedRouteRecord | null
	) => {
		// Hooks length may increase during hooks execution, new hooks should be ignored to prevent infinite loops
		const l = hooks[type].length;
		for (let i = 0; i < l; i++) {
			try {
				const hook = hooks[type][i];
				await hook(match, prev);
			} catch (e) {
				console.error(e);
			}
		}
	};

	__router.notFound(async () => {
		router.current = null;
		router.matched = [];
		for (const hook of hooks.notFound) {
			try {
				await hook();
			} catch (e) {
				console.error(e);
			}
		}
	});

	__router.hooks({
		async before(done, match) {
			const route = binding.get(match.route.handler)!;
			previousRoute.current = router.current;
			previousRoute.matched = router.matched;
			router.current = {
				...route,
				query: match.params ?? {},
				params: match.data ?? {}
			};
			router.matched = [...route.parents, route];
			router.__originalMatch = match;

			await applyHooks("before", router.current, previousRoute.current);
			done();
		},
		async after() {
			if (router.current) {
				applyHooks("after", router.current, previousRoute.current);
			}
		},
		async already(match) {
			previousRoute.current = router.current;
			previousRoute.matched = router.matched;

			Object.assign(router.current!, {
				query: match.params ?? {},
				params: match.data ?? {}
			});
			await applyHooks("update", router.current!, previousRoute.current);
		},
		async leave(done) {
			await applyHooks("leave", router.current!, null);
			done();
		}
	});

	const bindRoutes = (
		routes: RouteRecord[],
		parents?: RegisteredRouteRecord[]
	) => {
		routes.forEach(route => {
			const handler = () => {};
			const selfRoute = {
				...route,
				parents: parents ?? []
			};
			binding.set(handler, selfRoute);
			__router.on({
				[route.path]: {
					as: route.name,
					uses: handler
				}
			});
			if (route.children) {
				bindRoutes(route.children, (parents ?? []).concat([selfRoute]));
			}
		});
	};
	bindRoutes(routes);
	return router as Router;
};
