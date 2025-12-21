import { type ComicDetails } from "@puraty/server";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";

import api from "@/api";
import { useSharedData } from "@/utils/SharedData";

import style from "./index.module.css";

export default () => {
	const router = useRouter();
	const { id, comicId, chapter } = useRoute()!.params;
	const data = useSharedData<ComicDetails>(`comic-${id}-${comicId}`);
	const [images, setImages] = useState<string[]>([]);
	const [page, setPage] = useState(0);
	const [showTopBar, setShowTopBar] = useState(false);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState<string>("");
	const layer = createRef<HTMLDivElement>();

	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};

	const handleLayerClick = useCallback(
		(e: MouseEvent) => {
			if (e.target !== layer.current) return;
			setShowTopBar(false);
		},
		[layer]
	);

	const handleClick = useCallback(
		(e: MouseEvent) => {
			if (showTopBar) {
				handleLayerClick(e);
				return;
			}
			e.preventDefault();
			let lastPage = page;
			if (e.clientX > (innerWidth / 3) * 2) {
				lastPage--;
			} else if (e.clientX < innerWidth / 3) {
				lastPage++;
			} else {
				setShowTopBar(true);
				return;
			}
			lastPage = Math.max(0, Math.min(images.length - 1, lastPage));
			if (lastPage !== page) {
				setLoading(true);
				setPage(lastPage);
			}
		},
		[images, page, showTopBar]
	);

	const currentSrc = useMemo(() => {
		if (images.length === 0) return "";
		return api.proxy(id!, images[page], comicId!, chapter, page.toString());
	}, [page, images]);

	const onImageLoad = useCallback(() => {
		setLoading(false);
	}, []);

	const load = async () => {
		if (!id || !comicId) return;
		if (!data.value) {
			data.value = await api.Comic.detail(id, comicId);
		}
		setTitle(data.value.title);
		const pages = await api.Comic.pages(id, comicId, chapter);
		setImages(pages.images);
	};

	useEffect(() => {
		load();
	}, [id, comicId]);

	return (
		<div class={style.wrapper} onClick={handleClick}>
			<div
				class={style.layer}
				style={showTopBar ? "" : "display: none"}
				ref={layer}
			>
				<div class={style.layerTop}>
					<div class={style.layerTopMain}>
						<div onClick={toHome} class={`${style.iconBtn} clickable-item`}>
							<img src={ChevronLeftFilled}></img>
						</div>
						<span>{title}</span>
					</div>
				</div>
			</div>
			<img
				class={style.image}
				src={currentSrc}
				style={loading ? "display: none" : ""}
				onLoad={onImageLoad}
			></img>
			<div class={style.pageIndicator}>
				{page + 1}/{images.length}
			</div>
		</div>
	);
};
