import api from "@/api";
import { RouterLink } from "@/router/RouterLink";

export default () => {
	api.ComicSource.list().then(source => {
		source.forEach(item => {
			el.appendChild(
				<div>
					<RouterLink href={"/source/" + item.key}>{item.name}</RouterLink>
				</div>
			);
		});
	});
	const el = <div></div>;
	return el;
};
