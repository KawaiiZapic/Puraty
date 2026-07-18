import type { Comic, ComicHistoryItem } from "@puraty/server";
import AddOutlined from "@sicons/material/AddOutlined.svg";
import ExploreOutlined from "@sicons/material/ExploreOutlined.svg";
import HistoryOutlined from "@sicons/material/HistoryOutlined.svg";

import api from "@/api";
import {
	List,
	ListIcon,
	ListItem,
	ListTitle,
	useLoadingWrapper,
	useModal
} from "@/components";
import { SimpleComicItem } from "@/components/Comic/SimpleComicItem";
import { useComicSources } from "@/context/source";

import style from "./index.module.css";

const toComic = (item: ComicHistoryItem): Comic => ({
	id: item.comicId,
	title: item.title,
	subtitle: item.subtitle ?? "",
	subTitle: item.subtitle ?? "",
	cover: item.cover,
	tags: [],
	description: "",
	maxPage: item.maxPage
});

const ComicHistory = () => {
	const modal = useModal();
	const [items, setItems] = useState<ComicHistoryItem[]>([]);
	const [deleting, setDeleting] = useState<number | "all">();
	const load = useCallback(async () => {
		setItems((await api.Comic.history(1, 20)).items);
	}, []);
	const { LoadingWrapper, refresh } = useLoadingWrapper(load);

	useEffect(() => {
		refresh();
	}, []);

	const clear = async () => {
		modal
			.confirm("确定清空全部阅读历史吗？", "清空历史")
			.then(async () => {
				setDeleting("all");
				try {
					await api.Comic.clearHistory();
					setItems([]);
				} catch (error) {
					modal.alert("清空失败：" + api.normalizeError(error));
				} finally {
					setDeleting(undefined);
				}
			})
			.catch();
	};

	return (
		<List withIcon>
			<ListTitle>
				<ListIcon icon={HistoryOutlined}></ListIcon>阅读历史
				{If(items.length > 0)(
					<button
						class={style.clearButton}
						disabled={typeof deleting !== "undefined"}
						onClick={clear}
					>
						清空
					</button>
				).End()}
			</ListTitle>
			<LoadingWrapper style="padding: 1rem 0; text-align: center">
				{If(items.length === 0)(
					<div class={style.emptyHistory}>暂无阅读历史</div>
				).Else(
					<div class="mx-1 grid grid-cols-4">
						{items.map(item => (
							<SimpleComicItem
								class="w-1/4 min-w-240px pt-2"
								sourceId={item.sourceId}
								comic={toComic(item)}
								key={item.comicId + item.comicId}
							/>
						))}
					</div>
				)}
			</LoadingWrapper>
		</List>
	);
};

const MainPage = () => {
	const list = useComicSources();
	return (
		<div>
			<List withIcon>
				<ListTitle>
					<ListIcon icon={ExploreOutlined}></ListIcon>探索
				</ListTitle>
				{list !== null &&
					list.length > 0 &&
					list.map(item => (
						<ListItem
							href={
								item.explore?.length === 1
									? `/comic/${item.key}/explore/0`
									: `/source/${item.key}`
							}
							key={item.key}
						>
							{item.name}
						</ListItem>
					))}
			</List>
			{list !== null && list.length === 0 && (
				<RouteLink
					href="/settings/comic-sources"
					class="flex flex-col items-center justify-center clickable-item opacity-60 py-6"
				>
					<img src={AddOutlined} class="w-16 h-16"></img>
					<div class="my-2">未安装漫画源</div>
					<div class="text-xs">点击添加</div>
				</RouteLink>
			)}
			<ComicHistory />
		</div>
	);
};

export default MainPage;
