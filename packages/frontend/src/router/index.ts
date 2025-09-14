import main from "@/pages/main";
import SettingsIndex from "@/pages/settings";
import ComicSourceList from "@/pages/settings/comic-source";
import ComicSourceDetail from "@/pages/comic-source/detail";
import ComicSourceExplore from "@/pages/comic-source/explore";
import Navigo, { type Match } from "navigo";
import type { FC } from "@puraty/render";

export const router = new Navigo("/", {
  hash: true
});
export let currentMatched: RouteRecord[] = [];
export let lastMatched: RouteRecord | null = null;
export let currentRouteInfo: Match | null = null;

export const shiftRouteViewTree = () => {
  return currentMatched.shift();
}

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
    path: "/settings/comic-sources",
    component: ComicSourceList
  }, 
  {
    path: "/source/:id",
    component: ComicSourceDetail
  }, 
  {
    path: "/source/:id/explore/:page",
    component: ComicSourceExplore
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
}

addRoutes(routes);

