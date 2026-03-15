import type { InstalledSourceDetail } from "@puraty/server";

import { useSearchText } from "../components/header";
import api from "@/api";
import { List, ListItem } from "@/components";

const SearchPage = () => {
	const searchText = useSearchText();
	const [list, setList] = useState<InstalledSourceDetail[] | null>(null);
	useEffect(() => {
		api.ComicSource.list().then(setList);
	}, []);
	return (
		<List>
			{If(searchText)(
				<>
					{list?.map(source =>
						If(source.features.search)(
							<ListItem key={source.key}>
								在{source.name}搜索：{searchText}
							</ListItem>
						).End()
					)}
					{list?.map(source =>
						If(
							source.features.idMatch &&
								new RegExp(source.features.idMatch).test(searchText)
						)(
							<ListItem
								key={source.key}
								href={`/comic/${source.key}/manga/${searchText}`}
							>
								在{source.name}打开漫画 {searchText}
							</ListItem>
						).End()
					)}
				</>
			).End()}
		</List>
	);
};

export default SearchPage;
