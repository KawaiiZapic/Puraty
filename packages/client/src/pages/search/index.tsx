import { useSearchText } from "../components/header";
import { List, ListItem } from "@/components";
import { useComicSources } from "@/context/source";

const safeRegExpTest = (regExp: string, str: string) => {
	try {
		return new RegExp(regExp).test(str);
	} catch {
		return false;
	}
};

const SearchPage = () => {
	const searchText = useSearchText();
	const list = useComicSources();
	return (
		<List>
			{If(searchText)(
				<>
					{list?.map(source =>
						If(source.features.search)(
							<ListItem
								key={source.key}
								href={`/search/${source.key}?q=${encodeURIComponent(searchText)}`}
							>
								在{source.name}搜索：{searchText}
							</ListItem>
						).End()
					)}
					{list?.map(source =>
						If(
							source.features.idMatch &&
								safeRegExpTest(source.features.idMatch, searchText)
						)(
							<ListItem
								key={`direct-open__${source.key}`}
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
