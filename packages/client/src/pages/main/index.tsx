import type { InstalledSourceDetail } from "@puraty/server";
import AddOutlined from "@sicons/material/AddOutlined.svg";
import ExploreOutlined from "@sicons/material/ExploreOutlined.svg";

import api from "@/api";
import { List, ListIcon, ListItem, ListTitle } from "@/components";

const MainPage = () => {
	const [list, setList] = useState<InstalledSourceDetail[] | null>(null);
	useEffect(() => {
		api.ComicSource.list().then(setList);
	}, []);
	return (
		<div>
			<List withIcon>
				<ListTitle>
					<ListIcon icon={ExploreOutlined}></ListIcon>探索
				</ListTitle>
				{list !== null &&
					list.length > 0 &&
					list.map(item => (
						<ListItem
							href={
								item.explore?.length === 1
									? `/comic/${item.key}/explore/0`
									: `/source/${item.key}`
							}
							key={item.key}
						>
							{item.name}
						</ListItem>
					))}
			</List>
			{list !== null && list.length === 0 && (
				<RouteLink
					href="/settings/comic-sources"
					class="flex flex-col items-center justify-center clickable-item opacity-60 py-6"
				>
					<img src={AddOutlined} class="w-16 h-16"></img>
					<div class="my-2">未安装漫画源</div>
					<div class="text-xs">点击添加</div>
				</RouteLink>
			)}
		</div>
	);
};

export default MainPage;
