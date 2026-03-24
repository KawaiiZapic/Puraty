import type { InstalledSourceDetail } from "@puraty/server";

import { setTitle } from "../components/header";
import { List, ListItem } from "@/components";
import { useComicSource } from "@/context/source";

type ExploreList = InstalledSourceDetail["explore"];

const ExploreListPage = () => {
	const route = useRoute();
	const providerId = route?.params.provider;
	const provider = useComicSource(providerId!);
	const [list, setList] = useState<ExploreList>();
	if (provider) {
		setTitle(provider.name);
		setList(provider.explore);
	}
	return (
		<List>
			{list?.map(item => (
				<ListItem
					key={item.id}
					href={`/comic/${providerId}/explore/${item.id}`}
				>
					{item.title}
				</ListItem>
			))}
		</List>
	);
};

export default ExploreListPage;
