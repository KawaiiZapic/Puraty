import WarningAmberOutlined from "@sicons/material/WarningAmberOutlined.svg";
import type { FunctionalComponent } from "preact";

import type { ListSourceDetail } from "..";
import api from "@/api";

import style from "./source-item.module.css";

const fc: FunctionalComponent<{
	item: ListSourceDetail;
}> = ({ item }) => {
	const [isLoading, setLoading] = useState(false);
	const [installedVersion, setInstalledVersion] = useState(
		item.installedVersion
	);
	const insBtnText = useMemo(() => {
		let res = "";
		if (installedVersion === item.version || !item.version) {
			res = "卸载";
		} else if (item.version) {
			res = installedVersion ? `升级到 ${item.version}` : "安装";
		}
		if (isLoading) {
			res = "正在" + res;
		}
		return res;
	}, [isLoading, item]);
	const doInstall = async () => {
		if (isLoading) return;
		setLoading(true);
		try {
			if (installedVersion !== item.version) {
				await api.ComicSource.add(item.fileName!, item.key).then(() => {
					setInstalledVersion(item.version);
				});
			} else {
				await api.ComicSource.delete(item.key).then(() => {
					setInstalledVersion(undefined);
				});
			}
		} finally {
			setLoading(false);
		}
	};
	const initializedMark =
		item.initialized === false ? (
			<img class={style.listWarnMark} src={WarningAmberOutlined}></img>
		) : undefined;
	return (
		<div class={style.listItemWrapper}>
			<div class={style.listItemMeta}>
				<div>
					{initializedMark}
					{item.name}
				</div>
				<div class={style.listItemDesc}>
					{item.installedVersion ?? item.version}
					{item.description ? " - " + item.description : ""}
				</div>
			</div>
			{installedVersion && (
				<RouteLink
					class={`clickable-item ${style.listItemBtn}`}
					href={"/settings/comic-sources/" + item.key}
				>
					设置
				</RouteLink>
			)}
			<div onClick={doInstall} class={`clickable-item ${style.listItemBtn}`}>
				{insBtnText}
			</div>
		</div>
	);
};

export default fc;
