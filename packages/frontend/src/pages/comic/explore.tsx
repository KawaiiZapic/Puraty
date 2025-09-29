import api from "@/api";
import { getCurrentRoute } from "@/router";
import { RouterLink } from "@/router/RouterLink";
import type { Comic } from "@puraty/server";
import style from "./explore.module.css";

const ComicItem = ({ comic, sourceId }: { comic: Comic, sourceId: string }) => {
  return <RouterLink href={ `/comic/${sourceId}/manga/${encodeURIComponent(comic.id)}` }>
    <div class={ [style.comicItemWrapper, "clickable-item"] }>
      <img class={ style.comicItemImage } src={ api.proxy(sourceId, comic.cover) }></img>
      <div class={ style.comicItemMeta }>
        <div class={ style.comicItemTitle }>{ comic.title }</div>
        <div class={ style.comicItemSubtitle }>{ comic.subTitle ?? comic.subtitle }</div>
        <div class={ style.comicItemSubtitle }>{ [comic.description, comic.maxPage ? `${comic.maxPage} 页` : ""].filter(v => !!v).join(" - ") }</div>
        <div class={ style.comicItemTagWrapper }>
          { comic.tags?.map(t => <div class={ style.comicItemTag }>{t}</div>) }
        </div>
      </div>
    </div>
  </RouterLink>;
}

export default () => {
  const route = getCurrentRoute();
  const id = route?.data?.id;
  const explore = route?.data?.explore;
  const root = <div></div>;
  (async () => {
    if (!id || !explore) return;
    const detail = await api.Comic.explore(id, explore);
    if (detail.type === "multiPageComicList") {
      detail.data.comics.forEach(comic => {
        root.appendChild(<ComicItem sourceId={ id } comic={ comic }></ComicItem>);
      });
    } else if (detail.type === "singlePageWithMultiPart") {
      Object.keys(detail.data).forEach(partId => {
        const partRoot = <div>
          <div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">{ partId }</div>
        </div>
        detail.data[partId].forEach(comic => {
          partRoot.appendChild(<ComicItem sourceId={ id } comic={ comic }></ComicItem>);
        });
        root.appendChild(partRoot);
      });
    } else if (detail.type === "multiPartPage") {
      detail.data.forEach(part => {
        const partRoot = <div>
          <div style="padding: 0.5rem 0.25rem; font-size: 1.25rem">{ part.title }</div>
        </div>
        part.comics.forEach(comic => {
          partRoot.appendChild(<ComicItem sourceId={ id } comic={ comic }></ComicItem>);
        });
        root.appendChild(partRoot);
      });
    }
  })();
  return root;
}