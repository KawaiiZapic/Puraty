import { type ComicDetails } from "@puraty/server";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import type { FunctionalComponent } from "preact";

import api from "@/api";
import { useSharedData } from "@/utils/SharedData";

import { BatteryIcon } from "./BatteryIcon";
import style from "./index.module.css";

const getTime = () => {
	const date = new Date();
	return `${date.getHours()}:${date.getMinutes()}`;
};

const ReaderOverlay: FunctionalComponent<{
	detail: ComicDetails | null;
	onClose: () => void;
}> = ({ detail, onClose }) => {
	const router = useRouter();
	const [time, setTime] = useState(getTime());
	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};
	const handleClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(getTime());
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, []);

	return (
		<div class={style.layer} onClick={handleClick}>
			<div class={style.layerTop}>
				<div class={style.layerTopQuickInfo}>
					<span class={style.time}>{time}</span>
					<span style={"flex-grow: 1"} />
					<BatteryIcon />
				</div>
				<div class={style.layerTopMain}>
					<div onClick={toHome} class={`${style.iconBtn} clickable-item`}>
						<img src={ChevronLeftFilled}></img>
					</div>
					<span>{detail?.title ?? "加载中..."}</span>
				</div>
			</div>
		</div>
	);
};

const ReaderPage = () => {
	const { id, comicId, chapter } = useRoute()!.params;
	const data = useSharedData<ComicDetails>(`comic-${id}-${comicId}`);
	const [images, setImages] = useState<string[]>([]);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [overlayVisible, setOverlayVisible] = useState(false);

	const handleClick = useCallback(
		(e: MouseEvent) => {
			e.preventDefault();
			let offset = 0;
			if (e.clientX > (innerWidth / 3) * 2) {
				offset--;
			} else if (e.clientX < innerWidth / 3) {
				offset++;
			} else {
				setOverlayVisible(true);
				return;
			}
			if (offset !== 0) {
				setPage(prev => prev + offset);
				setLoading(true);
			}
		},
		[images]
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
		const pages = await api.Comic.pages(id, comicId, chapter);
		setImages(pages.images);
	};

	useEffect(() => {
		load();
	}, [id, comicId]);

	return (
		<>
			{overlayVisible && (
				<ReaderOverlay
					detail={data.value}
					onClose={() => setOverlayVisible(false)}
				/>
			)}
			<div class={style.wrapper} onClick={handleClick}>
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
		</>
	);
};

export default ReaderPage;
