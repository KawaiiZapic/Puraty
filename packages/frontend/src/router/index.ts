import type { FC } from "@puraty/render";
import Navigo, { type Match } from "navigo";

import api from "@/api";
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
	title?: string;
	fullscreen?: boolean;
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
		component: SettingsIndex,
		title: "设置"
	},
	{
		path: "/settings/cache",
		component: ComicCache,
		title: "管理缓存"
	},
	{
		path: "/settings/comic-sources",
		component: ComicSourceList,
		title: "管理漫画源"
	},
	{
		path: "/settings/comic-sources/:id",
		component: ComicSourceConfig,
		title: "漫画源设置"
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
		component: ComicDetail,
		title: "漫画详情"
	},
	{
		path: "/comic/:id/manga/:comicId/:chapter",
		component: ComicReader,
		fullscreen: true
	}
];
let isCurrentFullscreen = false;
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
					if (lastMatched.fullscreen === true && !isCurrentFullscreen) {
						api.Command.fullscreen();
					} else {
						api.Command.exitFullscreen();
					}
					isCurrentFullscreen = lastMatched.fullscreen === true;
				}
			}
		});
		if (route.children) {
			addRoutes(route.children, [...(parents ?? []), route]);
		}
	});
};

addRoutes(routes);
