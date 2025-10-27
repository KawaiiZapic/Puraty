import { ref } from "@puraty/reactivity";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";

import { lastMatched, router } from "@/router";
import { RouterLink } from "@/router/RouterLink";

import style from "./header.module.css";

const title = ref("");
export const setTitle = (v: string) => (title.value = v);

export default () => {
	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};
	let isBack = false;
	const hideOnHome = ref("");
	const hideOnNotHome = ref("");
	const onRouteUpdate = () => {
		title.value = lastMatched?.title || "";
		const isFullScreen = lastMatched?.fullscreen ?? false;
		isBack = lastMatched?.path !== "/";
		if (isBack) {
			hideOnNotHome.value = "display: none";
			hideOnHome.value = "";
		} else {
			hideOnHome.value = "display: none";
			hideOnNotHome.value = "";
		}
		if (!isFullScreen) {
			document.documentElement.classList.remove("fullscreen");
		} else {
			document.documentElement.classList.add("fullscreen");
		}
	};
	window.addEventListener("route-update", onRouteUpdate);
	onRouteUpdate();
	return (
		<div class={style.wrapper}>
			<div
				onClick={toHome}
				class={[style.iconBtn, "clickable-item"]}
				style={hideOnHome}
			>
				<img src={ChevronLeftFilled}></img>
			</div>
			<input
				class={style.searchBar}
				placeholder="搜索"
				style={hideOnNotHome}
			></input>
			<div class={style.pageTitle} style={hideOnHome}>
				{title}
			</div>
			<RouterLink href="/settings" class={[style.iconBtn, "clickable-item"]}>
				<img src={SettingsFilled}></img>
			</RouterLink>
		</div>
	);
};
