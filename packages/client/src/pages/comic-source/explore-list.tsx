import { useEffect, useState } from "preact/hooks";

import { setTitle } from "../components/header";
import api from "@/api";
import { List, ListItem } from "@/components";
import { useRoute } from "@/router";

type ExploreList = Awaited<ReturnType<typeof api.ComicSource.get>>["explore"];

export default () => {
	const route = useRoute();
	const id = route?.params.id;
	const [list, setList] = useState<ExploreList>();
	useEffect(() => {
		if (!id) return;
		api.ComicSource.get(id).then(detail => {
			setTitle(detail.name);
			setList(detail.explore);
		});
	}, [id]);
	(async () => {})();
	return (
		<List>
			{list?.map(item => (
				<ListItem href={`/comic/${id}/explore/${item.id}`}>
					{item.title}
				</ListItem>
			))}
		</List>
	);
};
