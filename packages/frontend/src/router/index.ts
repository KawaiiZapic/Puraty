import main from "@/pages/main";
import SettingsIndex from "@/pages/settings";
import ComicSourceList from "@/pages/settings/comic-source";
import Navigo from "navigo";

export const router = new Navigo("/", {
  hash: true
});
export let currentMatched: RouteRecord | null = null;

interface RouteRecord {
  path: string;
  component: () => Element;
  name?: string;
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
  }
];
const addRoutes = (routes: RouteRecord[]) => {
  routes.forEach(route => {
    router.on({
      [route.path]: {
        as: route.name,
        uses() {
          if (currentMatched === route) {
            return;
          }
          currentMatched = route;
          window.dispatchEvent(new CustomEvent("route-update"));
        }
      }
    });
  });
}

addRoutes(routes);

