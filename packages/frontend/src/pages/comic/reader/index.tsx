import { computed, shallowRef } from "@puraty/reactivity";

import api from "@/api";
import { getCurrentRoute } from "@/router";

import style from "./index.module.css";

export default () => {
	const route = getCurrentRoute();
	const id = route?.data?.id;
	const comicId = route?.data?.comicId;
	const chapter = route?.data?.chapter;

	const images = shallowRef<string[]>([]);
	const currentPage = shallowRef(0);

	const handleClick = (e: MouseEvent) => {
		e.preventDefault();
		if (e.clientX > innerWidth / 2) {
			currentPage.value--;
		} else {
			currentPage.value++;
		}
		currentPage.value = Math.max(
			0,
			Math.min(images.value.length - 1, currentPage.value)
		);
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
	const root = (
		<div onClick={handleClick}>
			<img class={style.image} src={currentSrc}></img>
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
