import api from "@/api";
import LoadingWrapper from "@/components/LoadingWrapper";
import { getCurrentRoute } from "@/router";
import type { ComicDetails } from "@puraty/server";
import style from "./detail.module.css";

import FileUploadFilled from "@sicons/material/FileUploadFilled.svg"
import AccessTimeOutlined from "@sicons/material/AccessTimeOutlined.svg"
import ImageFilled from "@sicons/material/ImageFilled.svg"

const isUndef = (value: unknown): value is undefined => {
  return typeof value === "undefined";
}

const DetailMeta = ({ comic }: { comic: ComicDetails }) => {
  const root = <div class={ style.comicMetaWrapper }></div>;

  if (!isUndef(comic.uploader)) {
    root.appendChild(<div class={ style.comicMetaItem }>
      <img src={ FileUploadFilled }></img> { comic.uploader }
    </div>)
  }

  if (!isUndef(comic.uploadTime)) {
    root.appendChild(<div class={ style.comicMetaItem }>
      <img src={ AccessTimeOutlined }></img> { comic.uploadTime }
    </div>)
  }

    if (!isUndef(comic.updateTime)) {
    root.appendChild(<div class={ style.comicMetaItem }>
      <img src={ AccessTimeOutlined }></img> { comic.updateTime }
    </div>)
  }

  if (!isUndef(comic.maxPage)) {
    root.appendChild(<div class={ style.comicMetaItem }>
      <img src={ ImageFilled }></img> { comic.maxPage }
    </div>)
  }

  return root;
};

const DetailHeader = (sourceId: string, comic: ComicDetails) => {
  return <div class={ style.comicHeaderWrapper }>
    <img src={ api.proxy(sourceId, comic.cover) }></img>
    <div class={ style.comicHeaderRight }>
      <div class={ style.comicHeaderTitle }>{ comic.title }</div>
      <div class={ style.comicHeaderSub }>{ comic.subTitle ?? comic.subtitle }</div>
      <DetailMeta comic={ comic } />
      <div style="flex-grow: 1;"></div>
      <div>
        <button>阅读</button>
      </div>
    </div>
  </div>
}

const TagGroup = (name: string, tags: string[]) => {
  return <div class={ style.comicTagGroup }>
    <div class={ [style.comicTag, style.comicTagLeader ] }>{ name }</div>
    <div class={ style.comicTagList }>{ tags.map(t => <div class={ [ style.comicTag, "clickable-item" ] }>{t}</div>) }</div>
  </div> as HTMLElement;
}

const DetailTags = (tags?: Record<string, string[]>) => {
  if (!tags) {
    return <div></div>
  }
  const r: Element[] = [];
  for (const group in tags) {
    r.push(TagGroup(group, tags[group]));
  }
  return <div> { r } </div>
}

const DetailChapters = (chapters: Record<string, string>) => {
  const list = <div class={ style.comicChapterList }></div>;
  for (const chapter in chapters) {
    list.appendChild(<div class={ [style.comicChapterItem, "clickable-item"] } data-chapter={chapter}>{ chapters[chapter] }</div>);
  }
  return <div>
    <div class={ style.comicChapterTitle }>章节</div>
    { list }
  </div>;
};

const DetailDetails = (comic: ComicDetails) => {
  const root = <div>
  </div>;

  if (comic.description) {
    root.appendChild(<div class={ style.comicDescription }>{ comic.description }</div>);
  }

  if (comic.tags) {
    root.appendChild(DetailTags(comic.tags));
  }

  if (comic.chapters) {
    root.appendChild(DetailChapters(comic.chapters));
  }

  return root;
}

export default () => {
  const route = getCurrentRoute();
  const id = route?.data?.id;
  const comicId = route?.data?.comicId;
  const load = async () => {
    state.loading = true;
    try {
      if (!id || !comicId) { return }
      const data = await api.Comic.detail(id, comicId);
      root.appendChild(DetailHeader(id, data));
      root.appendChild(DetailDetails(data));
      state.loading = false;
    } catch (_) {
      console.error(_);
    }
  };
  const { state, $: Wrapper } = LoadingWrapper(load);
  load();
  const root = <div class={ style.comicDetailWrapper }>
    { Wrapper }
  </div>
  return root;
}