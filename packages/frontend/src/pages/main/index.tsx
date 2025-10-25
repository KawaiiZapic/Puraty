import api from "@/api";
import { List, ListItem, ListTitle } from "@/components";

export default () => {
	api.ComicSource.list().then(source => {
		source.forEach(item => {
			comicSourceList.appendChild(
				<ListItem href={"/source/" + item.key}>{item.name}</ListItem>
			);
		});
	});
	const comicSourceList = (
		<List>
			<ListTitle>探索</ListTitle>
		</List>
	);
	const el = <div>{comicSourceList}</div>;
	return el;
};
