import type { FC } from "@puraty/render";
import Navigo, { type Match } from "navigo";

import ComicDetail from "@/pages/comic/detail";
import ComicExplore from "@/pages/comic/explore";
import ComicReader from "@/pages/comic/reader";
import ComicSourceDetail from "@/pages/comic-source/explore-list";
import main from "@/pages/main";
import SettingsIndex from "@/pages/settings";
import ComicCache from "@/pages/settings/cache";
import ComicSourceList from "@/pages/settings/comic-source";
import ComicSourceConfig from "@/pages/settings/comic-source/config";

export const router = new Navigo("/", {
	hash: true
});
export let currentMatched: RouteRecord[] = [];
export let lastMatched: RouteRecord | null = null;
export let currentRouteInfo: Match | null = null;

export const shiftRouteViewTree = () => {
	return currentMatched.shift();
};

export const getCurrentRoute = () => currentRouteInfo;

export class RouteUpdateEvent extends Event {
	constructor() {
		super("route-update");
	}
}

interface RouteRecord {
	path: string;
	component: FC;
	name?: string;
	children?: RouteRecord[];
}

router.notFound(() => {
	currentMatched = [];
	lastMatched = null;
	window.dispatchEvent(new RouteUpdateEvent());
});

const routes: RouteRecord[] = [
	{
		path: "/",
		name: "home",
		component: main
	},
	{
		path: "/settings",
		component: SettingsIndex
	},
	{
		path: "/settings/cache",
		component: ComicCache
	},
	{
		path: "/settings/comic-sources",
		component: ComicSourceList
	},
	{
		path: "/settings/comic-sources/:id",
		component: ComicSourceConfig
	},
	{
		path: "/source/:id",
		component: ComicSourceDetail
	},
	{
		path: "/comic/:id/explore/:explore",
		component: ComicExplore
	},
	{
		path: "/comic/:id/manga/:comicId",
		component: ComicDetail
	},
	{
		path: "/comic/:id/manga/:comicId/:chapter",
		component: ComicReader
	}
];
const addRoutes = (routes: RouteRecord[], parents?: RouteRecord[]) => {
	routes.forEach(route => {
		router.on({
			[route.path]: {
				as: route.name,
				uses(match: Match) {
					currentRouteInfo = match;
					const p = parents ?? [];
					currentMatched = [...p, route];
					lastMatched = route;
					window.dispatchEvent(new RouteUpdateEvent());
				}
			}
		});
		if (route.children) {
			addRoutes(route.children, [...(parents ?? []), route]);
		}
	});
};

addRoutes(routes);
