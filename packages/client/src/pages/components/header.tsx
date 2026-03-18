import { signal } from "@preact/signals";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";

import style from "./header.module.css";

declare global {
	interface RouteMeta {
		showSearch: boolean;
	}
}

const title = signal("");
export const setTitle = (newVal: string) => {
	title.value = newVal;
};

const internalSearchText = signal("");
export const useSearchText = () => {
	return internalSearchText.value;
};

export const Header = () => {
	const router = useRouter();
	const toHome = () => {
		if (history.length === 0) {
			router.navigate("/");
		} else {
			history.go(-1);
		}
	};
	const [isHome, setIsHome] = useState(router.current?.name === "home");
	const [isSearch, setIsSearch] = useState(router.current?.name === "search");
	const [showSearch, setShowSearch] = useState(
		router.current?.meta?.showSearch === true
	);
	const [fallbackTitle, setFallbackTitle] = useState(
		router.current?.title || ""
	);
	useEffect(() => {
		return router.onEnter(({ title, meta, name }) => {
			setIsHome(name === "home");
			setIsSearch(name === "search");
			setShowSearch(meta?.showSearch === true);
			setFallbackTitle(title || "");
			setTitle("");
		});
	}, []);
	return (
		<div class={style.wrapper}>
			{!isHome && (
				<div onClick={toHome} class={`${style.iconBtn} clickable-item`}>
					<img src={ChevronLeftFilled}></img>
				</div>
			)}
			{showSearch ? (
				<input
					value={internalSearchText.value}
					onInput={e =>
						(internalSearchText.value = (e.target as HTMLInputElement).value)
					}
					onFocus={() => {
						if (isHome) {
							router.navigate("/search");
						} else if (!isSearch) {
							history.go(-1);
						}
					}}
					class={style.searchBar}
					placeholder="搜索"
				/>
			) : (
				<div class={style.pageTitle}>{title.value || fallbackTitle}</div>
			)}
			<RouteLink href="/settings" class={`${style.iconBtn} clickable-item`}>
				<img src={SettingsFilled}></img>
			</RouteLink>
		</div>
	);
};
