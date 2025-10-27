import { setTitle } from "../components/header";
import api from "@/api";
import { List, ListItem } from "@/components";
import { getCurrentRoute } from "@/router";

export default () => {
	const route = getCurrentRoute();
	const id = route?.data?.id;
	const root = <List></List>;
	(async () => {
		if (!id) return;
		const detail = await api.ComicSource.get(id);
		setTitle(detail.name);
		detail.explore?.forEach(e => {
			root.appendChild(
				<ListItem href={`/comic/${id}/explore/${e.id}`}>{e.title}</ListItem>
			);
		});
	})();
	return root;
};
