import type { InstalledSourceDetail } from "@puraty/server";
import ExploreOutlined from "@sicons/material/ExploreOutlined.svg";

import api from "@/api";
import { List, ListIcon, ListItem, ListTitle } from "@/components";

const MainPage = () => {
	const [list, setList] = useState<InstalledSourceDetail[]>([]);
	useEffect(() => {
		api.ComicSource.list().then(setList);
	}, []);
	return (
		<div>
			<List withIcon>
				<ListTitle>
					<ListIcon icon={ExploreOutlined}></ListIcon>探索
				</ListTitle>
				{list.map(item => (
					<ListItem href={"/source/" + item.key} key={item.key}>
						{item.name}
					</ListItem>
				))}
			</List>
		</div>
	);
};

export default MainPage;
