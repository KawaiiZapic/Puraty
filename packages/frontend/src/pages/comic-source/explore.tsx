import api from "@/api";
import { getCurrentRoute } from "@/router";

export default () => {
  const route = getCurrentRoute();
  const id = route?.data?.id;
  const page = route?.data?.page;
  const root = <div></div>;
  (async () => {
    if (!id || !page) return;
    const detail = await api.ComicSource.explore(id, page);
    const proxy = (url: string) => {
      return "/api/image/" + btoa(url);
    }
    if ("comics" in detail) {detail.comics.forEach(comic => {
      root.appendChild(<div style="display: flex">
          <img style="width: 5rem; height: 8rem; object-fit: contain" src={proxy(comic.cover)}></img>
          <div>
            <div>{ comic.title }</div>
            <div>{ comic.subTitle }</div>
          </div>
        </div>);
      });
    }
  })();
  return root;
}