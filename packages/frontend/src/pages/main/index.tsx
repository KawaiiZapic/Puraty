import api from "@/api";
import { List, ListItem } from "@/components";

export default () => {
	api.ComicSource.list().then(source => {
		source.forEach(item => {
			el.appendChild(
				<ListItem href={"/source/" + item.key}>{item.name}</ListItem>
			);
		});
	});
	const el = <List></List>;
	return el;
};
