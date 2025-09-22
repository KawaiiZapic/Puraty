import api from "@/api";
import { getCurrentRoute } from "@/router";
import { ComicItem } from "./components/ComicItem";

export default () => {
  const route = getCurrentRoute();
  const id = route?.data?.id;
  const explore = route?.data?.explore;
  const root = <div></div>;
  (async () => {
    if (!id || !explore) return;
    const detail = await api.ComicSource.explore(id, explore);
    if (detail.type === "multiPageComicList") {
      detail.data.comics.forEach(comic => {
        root.appendChild(<ComicItem comic={ comic }></ComicItem>);
      });
    } else if (detail.type === "singlePageWithMultiPart") {
      Object.keys(detail.data).forEach(partId => {
        const partRoot = <div>
          <div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">{ partId }</div>
        </div>
        detail.data[partId].forEach(comic => {
          partRoot.appendChild(<ComicItem comic={ comic }></ComicItem>);
        });
        root.appendChild(partRoot);
      });
    } else if (detail.type === "multiPartPage") {
      detail.data.forEach(part => {
        const partRoot = <div>
          <div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">{ part.title }</div>
        </div>
        part.comics.forEach(comic => {
          partRoot.appendChild(<ComicItem comic={ comic }></ComicItem>);
        });
        root.appendChild(partRoot);
      });
    }
  })();
  return root;
}