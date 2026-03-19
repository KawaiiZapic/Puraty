import api from "@/api";
import { useModal } from "@/components";
import { useComicSource, useComicSourcesRefresher } from "@/context/source";

import style from "./config.module.css";

export default function ComicSourceConfig() {
	const provider = useRoute()!.params.provider;
	const [isLoading, setIsLoading] = useState(false);
	const modal = useModal();
	const sourceDetail = useComicSource(provider);
	const refreshSource = useComicSourcesRefresher();
	const result = useMemo(() => {
		if (sourceDetail) {
			const initialValues = {
				...(sourceDetail?.settingValues || {})
			} as Record<string, string>;
			for (const k in sourceDetail.settings) {
				const s = sourceDetail.settings[k];
				if (!(k in initialValues) && s.type !== "callback" && s.default) {
					initialValues[k] = String(s.default);
				}
			}
			return initialValues;
		}
		return {};
	}, [sourceDetail]);

	const saveSettings = useMemo(() => {
		let timer: number | null = null;
		return (result: Record<string, string>) => {
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				api.ComicSource.modify(provider, {
					settingValues: result
				});
			}, 500);
		};
	}, [provider]);

	const handleUAPLogin = () => {
		modal
			.prompt(
				[
					{
						key: "username",
						title: "用户名"
					},
					{
						key: "password",
						title: "密码"
					}
				],
				"登录"
			)
			.then(async r => {
				if (!r.username || !r.password) return;
				setIsLoading(true);
				try {
					await api.ComicSource.basicLogin(provider, r.username, r.password);
					refreshSource();
					modal.alert("登录成功");
				} catch (e) {
					modal.alert("登录失败: " + api.normalizeError(e));
				} finally {
					setIsLoading(false);
				}
			})
			.catch(() => {});
	};

	const handleCookieLogin = () => {
		if (!sourceDetail) return;
		const cookieFields = sourceDetail.features.CookieLogin || [];
		modal
			.prompt(
				cookieFields.map(key => ({ key })),
				"Cookie 登录"
			)
			.then(async r => {
				setIsLoading(true);
				try {
					await api.ComicSource.cookieLogin(provider, r);
					refreshSource();
					modal.alert("登录成功");
				} catch (e) {
					modal.alert("登录失败: " + api.normalizeError(e));
				} finally {
					setIsLoading(false);
				}
			});
	};

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await api.ComicSource.logout(provider);
			refreshSource();
			modal.alert("已退出登录");
		} catch (e) {
			modal.alert("无法退出登录: " + api.normalizeError(e));
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCallback = async (key: string) => {
		setIsLoading(true);
		try {
			await api.ComicSource.execCallback(provider, key);
			refreshSource();
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (key: string, value: string) => {
		saveSettings({
			...result,
			[key]: value
		});
	};

	if (!sourceDetail) {
		return <></>;
	}

	return (
		<div>
			{sourceDetail.initializedError && (
				<div class={style.sourceInitializeError}>
					<div>警告：漫画源初始化失败</div>
					<pre>{sourceDetail.initializedError}</pre>
				</div>
			)}
			{If(sourceDetail.incompatible === true)(
				<div class={style.sourceInitializeError}>
					<div>漫画源版本过新，可能有部分功能不兼容</div>
				</div>
			).End()}
			{!sourceDetail.isLogged ? (
				<>
					{sourceDetail.features.UAPLogin && (
						<div class={style.sourceConfigItem}>
							用户名密码登录
							<button disabled={isLoading} onClick={handleUAPLogin}>
								登录
							</button>
						</div>
					)}
					{sourceDetail.features.CookieLogin && (
						<div class={style.sourceConfigItem}>
							Cookie 登录
							<button disabled={isLoading} onClick={handleCookieLogin}>
								登录
							</button>
						</div>
					)}
				</>
			) : (
				sourceDetail.features.logout && (
					<div class={style.sourceConfigItem}>
						已登录
						<button disabled={isLoading} onClick={handleLogout}>
							退出登录
						</button>
					</div>
				)
			)}
			{sourceDetail.settings &&
				Object.entries(sourceDetail.settings).map(([key, setting]) => {
					const item = (
						<div class={style.sourceConfigItem}>
							{setting.title}
							{setting.type === "input" && (
								<input
									name={key}
									value={result[key] || ""}
									onInput={e => handleInputChange(key, e.currentTarget.value)}
								/>
							)}
							{setting.type === "switch" && (
								<input
									type="checkbox"
									name={key}
									checked={result[key] === "true"}
									onChange={e =>
										handleInputChange(key, e.currentTarget.checked.toString())
									}
								/>
							)}
							{setting.type === "select" && (
								<select
									name={key}
									value={result[key] || ""}
									onChange={e => handleInputChange(key, e.currentTarget.value)}
								>
									{setting.options?.map(opt => (
										<option value={opt.value} key={opt.value}>
											{opt.text ?? opt.value}
										</option>
									))}
								</select>
							)}
							{setting.type === "callback" && (
								<button
									disabled={isLoading}
									onClick={() => handleCallback(key)}
								>
									{setting.buttonText ?? "执行"}
								</button>
							)}
						</div>
					);
					return item;
				})}
		</div>
	);
}
