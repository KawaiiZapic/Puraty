import { type ComicDetails } from "@puraty/server";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import type { FunctionalComponent } from "preact";

import api from "@/api";
import { getConfig } from "@/utils/config";
import { useSharedData } from "@/utils/SharedData";

import { BatteryIcon, UpdateBatteryStatus } from "./components/BatteryIcon";
import { useGesture } from "./gesture";
import style from "./index.module.css";

const getTime = () => {
	const date = new Date();
	return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

const TimeNow: FunctionalComponent = () => {
	const [time, setTime] = useState(getTime());
	useEffect(() => {
		const timer = setInterval(() => {
			setTime(getTime());
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, []);
	return <span class={style.time}>{time}</span>;
};

const ReaderOverlay: FunctionalComponent<{
	detail: ComicDetails | null;
	onClose: () => void;
}> = ({ detail, onClose }) => {
	const router = useRouter();
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

	return (
		<div class={style.layer} onClick={handleClick}>
			<div class={style.layerTop}>
				<div class={style.layerTopQuickInfo}>
					<TimeNow />
					<span class="flex-grow-1" />
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
	const g = useGesture();
	const config = getConfig();

	const cachedImages = useRef<HTMLImageElement[]>([]);

	useEffect(() => {
		const cached = cachedImages.current;
		for (let i = 0; i < images.length; i++) {
			if (
				i < page - config.readerPreloadPages ||
				i > page + config.readerPreloadPages
			) {
				if (cached[i]) {
					delete cached[i];
				}
			} else if (!cached[i]) {
				const img = new Image();
				img.src = api.proxy(id!, images[i], comicId!, chapter, i.toString());
				cached[i] = img;
			}
		}
	}, [page, images]);

	const handlePageTurn = useCallback(
		(next: boolean) => {
			let offset = 0;
			if (next) {
				offset++;
			} else {
				offset--;
			}
			if (offset !== 0) {
				setPage(prev => {
					const next = Math.min(Math.max(0, prev + offset), images.length - 1);
					if (next !== prev) {
						setLoading(true);
					}
					return next;
				});
			}
		},
		[images]
	);

	g.useGesture(
		"click",
		e => {
			if ((e.isCenter() && !e.isLeft() && !e.isRight()) || e.isTop()) {
				setTimeout(() => setOverlayVisible(true), 100);
			} else if (e.isLeft() || e.isRight()) {
				handlePageTurn(e.isLeft());
			}
		},
		[handlePageTurn]
	);

	g.useGesture(
		"swipe",
		e => {
			if (e.direction === "left") {
				handlePageTurn(false);
			} else if (e.direction === "right") {
				handlePageTurn(true);
			} else if (e.direction === "down") {
				setOverlayVisible(true);
			}
		},
		[handlePageTurn]
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
		UpdateBatteryStatus();
	}, [id, comicId]);

	return (
		<>
			{overlayVisible && (
				<ReaderOverlay
					detail={data.value}
					onClose={() => setOverlayVisible(false)}
				/>
			)}
			<div class={style.wrapper} {...g.listener}>
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
