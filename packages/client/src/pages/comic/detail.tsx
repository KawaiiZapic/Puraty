import type { ComicDetails, ComicHistoryItem } from "@puraty/server";
import FileUploadFilled from "@sicons/material/FileUploadFilled.svg";
import FileUploadSharp from "@sicons/material/FileUploadSharp.svg";
import ImageFilled from "@sicons/material/ImageFilled.svg";
import UpdateOutlined from "@sicons/material/UpdateOutlined.svg";
import type { FunctionalComponent } from "preact";

import api from "@/api";
import { useLoadingWrapper } from "@/components/LoadingWrapper";
import { useSharedData } from "@/utils/SharedData";

import style from "./detail.module.css";

const DetailMeta: FunctionalComponent<{ comic: ComicDetails }> = ({
	comic
}) => {
	return (
		<div class={style.comicMetaWrapper}>
			{comic.uploader && (
				<div class={style.comicMetaItem}>
					<img src={FileUploadFilled}></img> {comic.uploader}
				</div>
			)}

			{comic.uploadTime && (
				<div class={style.comicMetaItem}>
					<img src={FileUploadSharp}></img> {comic.uploadTime}
				</div>
			)}

			{comic.updateTime && (
				<div class={style.comicMetaItem}>
					<img src={UpdateOutlined}></img> {comic.updateTime}
				</div>
			)}

			{comic.maxPage && (
				<div class={style.comicMetaItem}>
					<img src={ImageFilled}></img> {comic.maxPage}
				</div>
			)}
		</div>
	);
};

const DetailHeader: FunctionalComponent<{
	sourceId: string;
	comicId: string;
	comic: ComicDetails;
	onRead: () => void;
	history?: ComicHistoryItem;
	onContinue: () => void;
}> = ({ sourceId, comicId, comic, onRead, history, onContinue }) => {
	return (
		<div class={style.comicHeaderWrapper}>
			<img src={api.proxy(sourceId, comic.cover, comicId)} />
			<div class={style.comicHeaderRight}>
				<div class={style.comicHeaderTitle}>{comic.title}</div>
				<div class={style.comicHeaderSub}>
					{comic.subTitle ?? comic.subtitle}
				</div>
				<DetailMeta comic={comic} />
				<div class="flex-grow-1"></div>
				<div class="flex gap-1">
					{If(history)(<button onClick={onContinue}>继续阅读</button>).Else(
						<button onClick={onRead}>阅读</button>
					)}
				</div>
			</div>
		</div>
	);
};

const TagGroup: FunctionalComponent<{
	name: string;
	tags: string[];
}> = ({ name, tags }) => {
	return (
		<div class={style.comicTagGroup}>
			<div class={`${style.comicTag} ${style.comicTagLeader}`}>{name}</div>
			<div class={style.comicTagList}>
				{tags.map((t, i) => (
					// Tags may be duplicate
					<div class={`${style.comicTag} clickable-item`} key={i}>
						{t}
					</div>
				))}
			</div>
		</div>
	);
};

const DetailTags: FunctionalComponent<{
	tags?: Record<string, string[] | string>;
}> = ({ tags }) => {
	if (!tags) {
		return;
	}

	const tagGroups = Object.entries(tags).map(([group, groupTags]) => {
		const tagList = Array.isArray(groupTags) ? groupTags : [groupTags];
		return <TagGroup name={group} tags={tagList} key={group} />;
	});

	return <div>{tagGroups}</div>;
};

const DetailChapters: FunctionalComponent<{
	comic: ComicDetails;
	onChapterSelect: (chapter: string) => void;
}> = ({ comic, onChapterSelect }) => {
	const chapterList = comic.chapters;
	if (!chapterList) return <div></div>;

	const chapters = Object.entries(chapterList).flatMap(([chapter, value]) => {
		if (typeof value === "string") {
			return (
				<div
					class={`${style.comicChapterItem} clickable-item`}
					onClick={() => onChapterSelect(chapter)}
				>
					{value}
				</div>
			);
		} else {
			return Object.entries(value).map(([subChapter, subChapterName]) => (
				<div
					class={`${style.comicChapterItem} clickable-item`}
					onClick={() => onChapterSelect(subChapter)}
					key={subChapter}
				>
					{chapter} - {subChapterName}
				</div>
			));
		}
	});

	return (
		<div>
			<div class={style.comicChapterTitle}>章节</div>
			<div class={style.comicChapterList}>{chapters}</div>
		</div>
	);
};

const DetailDetails: FunctionalComponent<{
	comic: ComicDetails;
	onChapterSelect: (chapter: string) => void;
}> = ({ comic, onChapterSelect }) => {
	return (
		<div>
			{comic.description && (
				<div class={style.comicDescription}>{comic.description}</div>
			)}

			{<DetailTags tags={comic.tags} />}

			{comic.chapters && (
				<DetailChapters comic={comic} onChapterSelect={onChapterSelect} />
			)}
		</div>
	);
};

const ComicDetailPage = () => {
	const router = useRouter();
	const route = useRoute();
	const provider = route?.params?.provider;
	const comicId = route?.params?.comicId;
	const data = useSharedData<ComicDetails>(`comic-${provider}-${comicId}`);
	const [history, setHistory] = useState<ComicHistoryItem>();

	const openManga = (_chapter?: string, page?: number) => {
		if (!data.value) return;

		let chapter = _chapter;
		if (!chapter) {
			if (!data.value.chapters) {
				chapter = "1";
			} else {
				chapter = Object.keys(data.value.chapters)[0] ?? "1";
				if (typeof data.value.chapters[chapter] !== "string") {
					chapter = Object.keys(data.value.chapters[chapter])[0];
				}
			}
		}

		const path = `/comic/${provider}/manga/${encodeURIComponent(comicId!)}/${chapter}`;
		router.navigate(page ? `${path}?page=${page}` : path);
	};

	const load = useCallback(async () => {
		if (!provider || !comicId) {
			return;
		}
		if (!data.value) {
			data.value = await api.Comic.detail(provider, comicId);
		}
	}, [provider, comicId]);

	const { LoadingWrapper, refresh } = useLoadingWrapper(load);

	useEffect(() => {
		refresh();
	}, [provider, comicId]);

	useEffect(() => {
		let active = true;
		setHistory(undefined);
		if (provider && comicId) {
			api.Comic.comicHistory(provider, comicId)
				.then(({ item }) => {
					if (active) setHistory(item ?? undefined);
				})
				.catch(error => {
					console.error("Failed to load comic history", error);
				});
		}
		return () => {
			active = false;
		};
	}, [provider, comicId]);

	return (
		<div class={style.comicDetailWrapper}>
			<LoadingWrapper>
				<DetailHeader
					sourceId={provider!}
					comicId={comicId!}
					comic={data.value}
					onRead={() => openManga()}
					history={history}
					onContinue={() => openManga(history?.chapter, history?.page ?? 0)}
				/>
				<DetailDetails
					comic={data.value}
					onChapterSelect={chapter => openManga(chapter)}
				/>
			</LoadingWrapper>
		</div>
	);
};

export default ComicDetailPage;
