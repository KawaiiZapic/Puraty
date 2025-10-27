import api from "@/api";
import { RouterLink } from "@/router/RouterLink";

import style from "./index.module.css";

export default () => {
	return (
		<div>
			<RouterLink
				href="/settings/comic-sources"
				class={[style.listItem, "clickable-item"]}
			>
				管理漫画源
			</RouterLink>
			<RouterLink
				href="/settings/cache"
				class={[style.listItem, "clickable-item"]}
			>
				管理缓存
			</RouterLink>
			<div
				onClick={() => api.Command.exit()}
				class={[style.listItem, "clickable-item"]}
			>
				退出 Puraty
			</div>
		</div>
	);
};
