import api from "@/api";

import style from "./index.module.css";

export default () => {
	return (
		<div>
			<RouteLink
				href="/settings/comic-sources"
				class={`${style.listItem} clickable-item`}
			>
				管理漫画源
			</RouteLink>
			<RouteLink
				href="/settings/cache"
				class={`${style.listItem} clickable-item`}
			>
				管理缓存
			</RouteLink>
			<RouteLink
				href="/settings/misc"
				class={`${style.listItem} clickable-item`}
			>
				其他设置
			</RouteLink>
			<div
				onClick={() => api.Command.exit()}
				class={`${style.listItem} clickable-item`}
			>
				退出 Puraty
			</div>
		</div>
	);
};
