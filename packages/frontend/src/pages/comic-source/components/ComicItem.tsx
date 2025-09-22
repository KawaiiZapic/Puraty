import type { Comic } from "@puraty/server"; 
import style from "./ComicItem.module.css";

const proxy = (url: string) => {
  return "/api/image/" + btoa(url);
}

export const ComicItem = ({ comic }: { comic: Comic }) => {
  return <div class={ style.comicItemWrapper }>
    <img class={ style.comicItemImage } src={proxy(comic.cover)}></img>
    <div class={ style.comicItemMeta }>
      <div class={ style.comicItemTitle }>{ comic.title }</div>
      <div class={ style.comicItemSubtitle }>{ comic.subTitle }</div>
      <div class={ style.comicItemTagWrapper }>
        { comic.tags?.map(t => <div class={ style.comicItemTag }>{t}</div>) }
      </div>
    </div>
  </div>;
}