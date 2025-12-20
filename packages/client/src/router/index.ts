import { createContext } from "preact";
import { useContext } from "preact/hooks";

//import ComicDetail from "@/pages/comic/detail";
//import ComicExplore from "@/pages/comic/explore";
//import ComicReader from "@/pages/comic/reader";
//import ComicSourceDetail from "@/pages/comic-source/explore-list";
import main from "@/pages/main";
import SettingsIndex from "@/pages/settings";
//import ComicCache from "@/pages/settings/cache";
import ComicSourceList from "@/pages/settings/comic-source";
import ComicSourceConfig from "@/pages/settings/comic-source/config";
//import MiscConfig from "@/pages/settings/main/index";

import fullscreen from "./plugins/fullscreen";
import { createRouter, type RouteRecord } from "./router";

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
	// {
	// 	path: "/settings/cache",
	// 	component: ComicCache,
	// 	title: "管理缓存"
	// },
	{
		path: "/settings/comic-sources",
		component: ComicSourceList,
		title: "管理漫画源"
	},
	{
		path: "/settings/comic-sources/:id",
		component: ComicSourceConfig,
		title: "漫画源设置"
	}
	// {
	// 	path: "/settings/misc",
	// 	component: MiscConfig,
	// 	title: "其他设置"
	// },
	// {
	// 	path: "/source/:id",
	// 	component: ComicSourceDetail
	// },
	// {
	// 	path: "/comic/:id/explore/:explore",
	// 	component: ComicExplore
	// },
	// {
	// 	path: "/comic/:id/manga/:comicId",
	// 	component: ComicDetail,
	// 	title: "漫画详情"
	// },
	// {
	// 	path: "/comic/:id/manga/:comicId/:chapter",
	// 	component: ComicReader,
	// 	meta: {
	// 		fullscreen: true,
	// 		disableSwipe: true
	// 	}
	// }
];

export const initializeRouter = () => {
	const router = createRouter(routes);
	router.with(fullscreen);
	router.ready();
	return router;
};

export const RouterContext = createContext<ReturnType<typeof createRouter>>(
	null as never
);
export const useRouter = () => useContext(RouterContext);
