import { signal } from "@preact/signals";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";
import { useEffect, useState } from "preact/hooks";

import { useRouter } from "@/router";
import { RouterLink } from "@/router/RouterLink";

import style from "./header.module.css";

const title = signal("");
export const setTitle = (newVal: string) => {
	title.value = newVal;
};

export default () => {
	const router = useRouter();
	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};
	const [isHome, setIsHome] = useState(false);
	useEffect(() => {
		setIsHome(router.current?.path === "/");
		return router.onEnter(({ path }) => {
			setIsHome(path === "/");
		});
	}, []);
	return (
		<div class={style.wrapper}>
			{!isHome && (
				<div onClick={toHome} class={`${style.iconBtn} clickable-item`}>
					<img src={ChevronLeftFilled}></img>
				</div>
			)}
			{isHome ? (
				<input class={style.searchBar} placeholder="搜索"></input>
			) : (
				<div class={style.pageTitle}>{title}</div>
			)}
			<RouterLink href="/settings" class={`${style.iconBtn} clickable-item`}>
				<img src={SettingsFilled}></img>
			</RouterLink>
		</div>
	);
};
