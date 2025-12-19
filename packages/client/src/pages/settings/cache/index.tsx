import api from "@/api";
import { FormatSize } from "@/components/FormatSize";

import style from "./index.module.css";

export default () => {
	const date = Date.now();
	const clean = (before: number) => {
		api.Comic.cleanCache(date - before).then(() => {
			load();
		});
	};
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

	const d1 = 24 * 60 * 60 * 1000;
	const load = () => {
		api.Comic.cache().then(d => {
			$.textContent = "";
			const Total = (
				<CacheItem before={0} title="总大小" size={d.size}></CacheItem>
			);
			const D3 = (
				<CacheItem before={3 * d1} title="3天前" size={d.D3}></CacheItem>
			);
			const D7 = (
				<CacheItem before={7 * d1} title="7天前" size={d.D7}></CacheItem>
			);
			const D30 = (
				<CacheItem before={30 * d1} title="30天前" size={d.D30}></CacheItem>
			);
			const Y1 = (
				<CacheItem before={365 * d1} title="1年前" size={d.D365}></CacheItem>
			);
			[Total, D3, D7, D30, Y1].forEach(d => {
				$.appendChild(d);
			});
		});
	};
	const $ = <div></div>;
	load();
	return $;
};
