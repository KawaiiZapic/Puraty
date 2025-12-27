import type { FunctionalComponent } from "preact";

import api from "@/api";
import { FormatSize } from "@/components/FormatSize";

import style from "./index.module.css";

const CacheItem: FunctionalComponent<{
	title: string;
	size: number;
	onClean: () => void;
}> = attr => {
	const $ = (
		<div class={style.cacheItem}>
			<span class={style.cacheTitle}>{attr.title}</span>
			<span style="flex-grow: 1;" />
			<FormatSize size={attr.size} />
			<button onClick={() => attr.onClean()}>清理</button>
		</div>
	);
	return $;
};

const CachePage = () => {
	const [date, setDate] = useState(0);
	const [size, setSize] = useState({
		size: 0,
		D3: 0,
		D7: 0,
		D30: 0,
		D365: 0
	});

	const update = useCallback(() => {
		api.Comic.cache().then(data => {
			setDate(Date.now());
			setSize(data);
		});
	}, []);

	const clean = useMemo(() => {
		return (before: number) => {
			api.Comic.cleanCache(date - before).then(() => {
				update();
			});
		};
	}, [date]);

	useEffect(() => {
		update();
	}, []);

	const d1 = 24 * 60 * 60 * 1000;
	return (
		<div>
			<CacheItem
				onClean={() => clean(0)}
				title="总大小"
				size={size.size}
			></CacheItem>
			<CacheItem
				onClean={() => clean(3 * d1)}
				title="3天前"
				size={size.D3}
			></CacheItem>
			<CacheItem
				onClean={() => clean(7 * d1)}
				title="7天前"
				size={size.D7}
			></CacheItem>
			<CacheItem
				onClean={() => clean(30 * d1)}
				title="30天前"
				size={size.D30}
			></CacheItem>
			<CacheItem
				onClean={() => clean(365 * d1)}
				title="1年前"
				size={size.D365}
			></CacheItem>
		</div>
	);
};

export default CachePage;
