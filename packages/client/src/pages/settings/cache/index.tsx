import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import api from "@/api";
import { FormatSize } from "@/components/FormatSize";

import style from "./index.module.css";

export default () => {
	const [size, setSize] = useState({
		size: 0,
		D3: 0,
		D7: 0,
		D30: 0,
		D365: 0
	});

	const update = useCallback(() => {
		api.Comic.cache().then(setSize);
	}, []);

	const clean = useMemo(() => {
		const date = Date.now();
		return (before: number) => {
			api.Comic.cleanCache(date - before).then(() => {
				update();
			});
		};
	}, []);
	const CacheItem = (attr: { title: string; size: number; before: number }) => {
		const $ = (
			<div class={style.cacheItem}>
				<span class={style.cacheTitle}>{attr.title}</span>
				<span style="flex-grow: 1;" />
				<FormatSize size={attr.size} />
				<button onClick={() => clean(attr.before)}>清理</button>
			</div>
		);
		return $;
	};

	useEffect(() => {
		update();
	}, []);

	const d1 = 24 * 60 * 60 * 1000;
	return (
		<div>
			<CacheItem before={0} title="总大小" size={size.size}></CacheItem>
			<CacheItem before={3 * d1} title="3天前" size={size.D3}></CacheItem>
			<CacheItem before={7 * d1} title="7天前" size={size.D7}></CacheItem>
			<CacheItem before={30 * d1} title="30天前" size={size.D30}></CacheItem>
			<CacheItem before={365 * d1} title="1年前" size={size.D365}></CacheItem>
		</div>
	);
};
