import { computed, shallowRef } from "@puraty/reactivity";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";

import api from "@/api";
import LoadingWrapper from "@/components/LoadingWrapper";
import { getCurrentRoute, router } from "@/router";

import style from "./index.module.css";

export default () => {
	const route = getCurrentRoute();
	const id = route?.data?.id;
	const comicId = route?.data?.comicId;
	const chapter = route?.data?.chapter;

	const images = shallowRef<string[]>([]);
	const imageCount = computed(() => images.value.length);
	const currentPage = shallowRef(0);
	const displayCurrentPage = computed(() => {
		return currentPage.value + 1;
	});

	const { $: $wrapper, state: loadingState } = LoadingWrapper(() => {});

	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};

	const showTopBar = shallowRef(false);

	const handleClick = (e: MouseEvent) => {
		if (showTopBar.value) return;
		e.preventDefault();
		const lastPage = currentPage.value;
		if (e.clientX > (innerWidth / 3) * 2) {
			currentPage.value--;
		} else if (e.clientX < innerWidth / 3) {
			currentPage.value++;
		} else {
			showTopBar.value = true;
			return;
		}
		currentPage.value = Math.max(
			0,
			Math.min(images.value.length - 1, currentPage.value)
		);
		if (lastPage !== currentPage.value) {
			img.style.display = "none";
			loadingState.loading = true;
		}
	};
	const currentSrc = computed(() => {
		if (images.value.length === 0) return "";
		return api.proxy(
			id!,
			images.value[currentPage.value],
			comicId!,
			chapter,
			currentPage.value.toString()
		);
	});
	const img = (
		<img class={style.image} src={currentSrc} style="display: none"></img>
	) as HTMLImageElement;
	img.addEventListener("load", () => {
		img.style.display = "";
		loadingState.loading = false;
	});

	const layer = (
		<div class={style.layer} p-show={showTopBar}>
			<div class={style.layerTop}>
				<div>
					<div onClick={toHome} class={[style.iconBtn, "clickable-item"]}>
						<img src={ChevronLeftFilled}></img>
					</div>
				</div>
			</div>
		</div>
	);
	const root = (
		<div class={style.wrapper} onClick={handleClick}>
			{layer}
			{$wrapper}
			{img}
			<div class={style.pageIndicator}>
				{displayCurrentPage}/{imageCount}
			</div>
		</div>
	);

	const load = async () => {
		if (!id || !comicId) return;
		const data = await api.Comic.pages(id, comicId, chapter);
		images.value = data.images;
	};

	load();

	return root;
};
