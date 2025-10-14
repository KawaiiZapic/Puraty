import api from "@/api";
import LoadingWrapper from "@/components/LoadingWrapper";

import SourceItem from "./components/source-item";

export default () => {
	const load = async () => {
		state.loading = true;
		try {
			const installed = await api.ComicSource.list(true);
			installed.forEach(source => {
				list.prepend(
					SourceItem({
						item: {
							key: source.key,
							name: source.name,
							version: source.version,
							fileName: "",
							initialized: !source.initializedError
						},
						installedVersion: source.version
					})
				);
			});
			await api.ComicSource.available().then(available => {
				list.innerHTML = "";
				installed.forEach(source => {
					const orig = available.find(it => it.key === source.key);
					list.prepend(
						SourceItem({
							item: {
								key: source.key,
								name: source.name,
								version: orig?.version || source.version,
								fileName: orig?.fileName || "",
								description: orig?.description,
								initialized: !source.initializedError
							},
							installedVersion: source.version
						})
					);
				});
				available.forEach(item => {
					if (installed.find(it => it.key === item.key)) return;
					list.appendChild(SourceItem({ item }));
				});
			});
		} catch (_) {
			state.errorMsg = "加载列表失败";
		} finally {
			state.loading = false;
		}
	};
	const { state, $: loadingWrapper } = LoadingWrapper(load);
	load();
	const list = (<div>{loadingWrapper}</div>) as HTMLElement;

	return list;
};
