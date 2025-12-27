import type { InstalledSourceDetail } from "@puraty/server";

import api from "@/api";
import { useModal } from "@/components";

import style from "./config.module.css";

export default function ComicSourceConfig() {
	const id = useRouter().current!.params.id!;
	const [sourceDetail, setSourceDetail] =
		useState<InstalledSourceDetail | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<Record<string, string>>({});
	const modal = useModal();

	useEffect(() => {
		api.ComicSource.get(id).then(v => {
			setSourceDetail(v);
			const initialValues = { ...v.settingValues } as Record<string, string>;
			for (const k in v.settings) {
				const s = v.settings[k];
				if (!(k in initialValues) && s.type !== "callback" && s.default) {
					initialValues[k] = String(s.default);
				}
			}
			setResult(initialValues);
		});
	}, [id]);

	const saveSettings = useMemo(() => {
		let timer: number | null = null;
		return (result: Record<string, string>) => {
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				api.ComicSource.modify(id, {
					settingValues: result
				});
			}, 500);
		};
	}, [id]);

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
					await api.ComicSource.doUAPLogin(id, r.username, r.password);
					setSourceDetail(prev => (prev ? { ...prev, isLogged: true } : null));
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
					await api.ComicSource.doCookieLogin(id, r);
					setSourceDetail(prev => (prev ? { ...prev, isLogged: true } : null));
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
			await api.ComicSource.logout(id);
			setSourceDetail(prev => (prev ? { ...prev, isLogged: false } : null));
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
			await api.ComicSource.execCallback(id, key);
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
