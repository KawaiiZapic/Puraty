import { not, shallowRef } from "@puraty/reactivity";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";

import { router } from "@/router";
import { RouterLink } from "@/router/RouterLink";

import style from "./header.module.css";

const title = shallowRef("");
export const setTitle = (v: string) => (title.value = v);

export default () => {
	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};
	const isBack = shallowRef(false);
	const onRouteUpdate = () => {
		title.value = router.current?.title ?? router.current?.name ?? "";
		isBack.value = router.current?.path !== "/";
	};
	router.onEnter(onRouteUpdate);
	return (
		<div class={style.wrapper}>
			<div
				onClick={toHome}
				class={[style.iconBtn, "clickable-item"]}
				p-show={isBack}
			>
				<img src={ChevronLeftFilled}></img>
			</div>
			<input
				class={style.searchBar}
				placeholder="搜索"
				p-show={not(isBack)}
			></input>
			<div class={style.pageTitle} p-show={isBack}>
				{title}
			</div>
			<RouterLink href="/settings" class={[style.iconBtn, "clickable-item"]}>
				<img src={SettingsFilled}></img>
			</RouterLink>
		</div>
	);
};
