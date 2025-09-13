import main from "@/pages/main";
import SettingsIndex from "@/pages/settings";
import ComicSourceList from "@/pages/settings/comic-source";
import Navigo from "navigo";
import type { FC } from "@puraty/render";

export const router = new Navigo("/", {
  hash: true
});
export let currentMatched: RouteRecord[] = [];
export let lastMatched: RouteRecord | null = null;

export const shiftRouteViewTree = () => {
  return currentMatched.shift();
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
    component: SettingsIndex,
    children: [
      {
        path: "/settings/comic-sources/1",
        component: main
      },
      {
        path: "/settings/comic-sources/2",
        component: SettingsIndex
      }
    ]
  },
  {
    path: "/settings/comic-sources",
    component: ComicSourceList
  }
];
const addRoutes = (routes: RouteRecord[], parents?: RouteRecord[]) => {
  routes.forEach(route => {
    router.on({
      [route.path]: {
        as: route.name,
        uses() {
          const p = parents ?? [];
          currentMatched = [...p, route];
          lastMatched = route;
          window.dispatchEvent(new CustomEvent("route-update"));
        }
      }
    });
    if (route.children) {
      addRoutes(route.children, [...(parents ?? []), route]);
    }
  });
}

addRoutes(routes);

