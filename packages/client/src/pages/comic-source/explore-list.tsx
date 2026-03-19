import { setTitle } from "../components/header";
import api from "@/api";
import { List, ListItem } from "@/components";

type ExploreList = Awaited<ReturnType<typeof api.ComicSource.get>>["explore"];

const ExploreListPage = () => {
	const route = useRoute();
	const provider = route?.params.provider;
	const [list, setList] = useState<ExploreList>();
	useEffect(() => {
		if (!provider) return;
		api.ComicSource.get(provider).then(detail => {
			setTitle(detail.name);
			setList(detail.explore);
		});
	}, [provider]);
	(async () => {})();
	return (
		<List>
			{list?.map(item => (
				<ListItem key={item.id} href={`/comic/${provider}/explore/${item.id}`}>
					{item.title}
				</ListItem>
			))}
		</List>
	);
};

export default ExploreListPage;
