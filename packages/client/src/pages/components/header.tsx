import { signal } from "@preact/signals";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";

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
	const [fallbackTitle, setFallbackTitle] = useState("");
	useEffect(() => {
		setIsHome(router.current?.path === "/");
		setFallbackTitle(router.current?.title || "");
		return router.onEnter(({ path, title }) => {
			setIsHome(path === "/");
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
			{isHome ? (
				<input class={style.searchBar} placeholder="搜索"></input>
			) : (
				<div class={style.pageTitle}>{title.value || fallbackTitle}</div>
			)}
			<RouteLink href="/settings" class={`${style.iconBtn} clickable-item`}>
				<img src={SettingsFilled}></img>
			</RouteLink>
		</div>
	);
};
