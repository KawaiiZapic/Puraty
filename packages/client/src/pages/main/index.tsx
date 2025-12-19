import ExploreOutlined from "@sicons/material/ExploreOutlined.svg";

import api from "@/api";
import { List, ListIcon, ListItem, ListTitle } from "@/components";

export default () => {
	api.ComicSource.list().then(source => {
		source.forEach(item => {
			comicSourceList.appendChild(
				<ListItem href={"/source/" + item.key}>{item.name}</ListItem>
			);
		});
	});
	const comicSourceList = (
		<List withIcon>
			<ListTitle>
				<ListIcon icon={ExploreOutlined}></ListIcon>探索
			</ListTitle>
		</List>
	);
	const el = <div>{comicSourceList}</div>;
	return el;
};
