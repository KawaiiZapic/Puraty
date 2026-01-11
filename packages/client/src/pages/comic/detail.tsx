import type { ComicDetails } from "@puraty/server";
import AccessTimeOutlined from "@sicons/material/AccessTimeOutlined.svg";
import FileUploadFilled from "@sicons/material/FileUploadFilled.svg";
import ImageFilled from "@sicons/material/ImageFilled.svg";

import api from "@/api";
import LoadingWrapper from "@/components/LoadingWrapper";
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
					<img src={AccessTimeOutlined}></img> {comic.uploadTime}
				</div>
			)}

			{comic.updateTime && (
				<div class={style.comicMetaItem}>
					<img src={AccessTimeOutlined}></img> {comic.updateTime}
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
}> = ({ sourceId, comicId, comic, onRead }) => {
	return (
		<div class={style.comicHeaderWrapper}>
			<img src={api.proxy(sourceId, comic.cover, comicId)} />
			<div class={style.comicHeaderRight}>
				<div class={style.comicHeaderTitle}>{comic.title}</div>
				<div class={style.comicHeaderSub}>
					{comic.subTitle ?? comic.subtitle}
				</div>
				<DetailMeta comic={comic} />
				<div style="flex-grow: 1;"></div>
				<div>
					<button onClick={onRead}>阅读</button>
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
	const id = route?.params?.id;
	const comicId = route?.params?.comicId;
	const data = useSharedData<ComicDetails>(`comic-${id}-${comicId}`);
	const [loading, setLoading] = useState(true);

	const openManga = (_chapter?: string) => {
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

		router.navigate(
			`/comic/${id}/manga/${encodeURIComponent(comicId!)}/${chapter}`
		);
	};

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				if (!id || !comicId) {
					return;
				}
				if (!data.value) {
					data.value = await api.Comic.detail(id, comicId);
				}
				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		};

		load();
	}, [id, comicId]);

	return (
		<div class={style.comicDetailWrapper}>
			<LoadingWrapper loading={loading}>
				<DetailHeader
					sourceId={id!}
					comicId={comicId!}
					comic={data.value}
					onRead={() => openManga()}
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
