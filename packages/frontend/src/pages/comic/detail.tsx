import { nextTick } from "@puraty/reactivity";
import type { ComicDetails } from "@puraty/server";
import AccessTimeOutlined from "@sicons/material/AccessTimeOutlined.svg";
import FileUploadFilled from "@sicons/material/FileUploadFilled.svg";
import ImageFilled from "@sicons/material/ImageFilled.svg";

import api from "@/api";
import { LazyImg } from "@/components/LazyImg";
import LoadingWrapper from "@/components/LoadingWrapper";
import { router } from "@/router";

import style from "./detail.module.css";

const isUndef = (value: unknown): value is undefined => {
	return typeof value === "undefined";
};

const DetailMeta = ({ comic }: { comic: ComicDetails }) => {
	const root = <div class={style.comicMetaWrapper}></div>;

	if (!isUndef(comic.uploader)) {
		root.appendChild(
			<div class={style.comicMetaItem}>
				<img src={FileUploadFilled}></img> {comic.uploader}
			</div>
		);
	}

	if (!isUndef(comic.uploadTime)) {
		root.appendChild(
			<div class={style.comicMetaItem}>
				<img src={AccessTimeOutlined}></img> {comic.uploadTime}
			</div>
		);
	}

	if (!isUndef(comic.updateTime)) {
		root.appendChild(
			<div class={style.comicMetaItem}>
				<img src={AccessTimeOutlined}></img> {comic.updateTime}
			</div>
		);
	}

	if (!isUndef(comic.maxPage)) {
		root.appendChild(
			<div class={style.comicMetaItem}>
				<img src={ImageFilled}></img> {comic.maxPage}
			</div>
		);
	}

	return root;
};

const DetailHeader = (
	sourceId: string,
	comicId: string,
	comic: ComicDetails
) => {
	return (
		<div class={style.comicHeaderWrapper}>
			<LazyImg src={api.proxy(sourceId, comic.cover, comicId)}></LazyImg>
			<div class={style.comicHeaderRight}>
				<div class={style.comicHeaderTitle}>{comic.title}</div>
				<div class={style.comicHeaderSub}>
					{comic.subTitle ?? comic.subtitle}
				</div>
				<DetailMeta comic={comic} />
				<div style="flex-grow: 1;"></div>
				<div>
					<button onClick={() => openManga(comic)}>阅读</button>
				</div>
			</div>
		</div>
	);
};

const TagGroup = (name: string, tags: string[]) => {
	return (
		<div class={style.comicTagGroup}>
			<div class={[style.comicTag, style.comicTagLeader]}>{name}</div>
			<div class={style.comicTagList}>
				{tags.map(t => (
					<div class={[style.comicTag, "clickable-item"]}>{t}</div>
				))}
			</div>
		</div>
	) as HTMLElement;
};

const DetailTags = (tags?: Record<string, string[] | string>) => {
	if (!tags) {
		return <div></div>;
	}
	const r: Element[] = [];
	for (const group in tags) {
		r.push(
			TagGroup(group, Array.isArray(tags[group]) ? tags[group] : [tags[group]])
		);
	}
	return <div> {r} </div>;
};

const DetailChapters = (comic: ComicDetails) => {
	const list = <div class={style.comicChapterList}></div>;
	const chapterList = comic.chapters!;
	if (!chapterList) return list;
	for (const chapter in chapterList) {
		if (typeof chapterList[chapter] === "string") {
			list.appendChild(
				<div
					class={[style.comicChapterItem, "clickable-item"]}
					data-chapter={chapter}
					onClick={() => openManga(comic, chapter)}
				>
					{chapterList[chapter]}
				</div>
			);
		} else {
			for (const subChapter in chapterList[chapter]) {
				list.appendChild(
					<div
						class={[style.comicChapterItem, "clickable-item"]}
						data-chapter={subChapter}
						onClick={() => openManga(comic, subChapter)}
					>
						{chapter} - {chapterList[chapter][subChapter]}
					</div>
				);
			}
		}
	}
	return (
		<div>
			<div class={style.comicChapterTitle}>章节</div>
			{list}
		</div>
	);
};

const DetailDetails = (comic: ComicDetails) => {
	const root = <div></div>;

	if (comic.description) {
		root.appendChild(
			<div class={style.comicDescription}>{comic.description}</div>
		);
	}

	if (comic.tags) {
		root.appendChild(DetailTags(comic.tags));
	}

	if (comic.chapters) {
		root.appendChild(DetailChapters(comic));
	}

	return root;
};

const openManga = (comic: ComicDetails, _chapter?: string) => {
	const route = router.current;
	const id = route?.params?.id;
	const comicId = route?.params?.comicId;
	let chapter = _chapter;
	if (!chapter) {
		if (!comic.chapters) {
			chapter = "1";
		} else {
			chapter = Object.keys(comic.chapters)[0] ?? "1";
		}
	}
	router.navigate(
		`/comic/${id}/manga/${encodeURIComponent(comicId!)}/${chapter}`
	);
};

export default () => {
	const route = router.current;
	const id = route?.params?.id;
	const comicId = route?.params?.comicId;
	const load = async () => {
		state.loading = true;
		try {
			if (!id || !comicId) {
				return;
			}
			const data = await api.Comic.detail(id, comicId);
			state.loading = false;
			nextTick(() => {
				root.appendChild(DetailHeader(id, comicId, data));
				root.appendChild(DetailDetails(data));
			});
		} catch (_) {
			console.error(_);
		}
	};
	const { state, $: Wrapper } = LoadingWrapper(load);
	load();
	const root = <div class={style.comicDetailWrapper}>{Wrapper}</div>;
	return root;
};
