export interface AppConfig {
	httpProxy: string;
	readerPreloadPages: number;
}

export const defaultValues: AppConfig = {
	httpProxy: "",
	readerPreloadPages: 3
};

export const configValidator: Record<keyof AppConfig, (v: unknown) => boolean> =
	{
		httpProxy: (v: unknown) =>
			typeof v === "string" && (/^https?:\/\/.*?:\d{1,5}/.test(v) || v === ""),
		readerPreloadPages: (v: unknown) =>
			typeof v === "string" &&
			parseInt(v).toString() === v &&
			parseInt(v) > 0 &&
			parseInt(v) < 15
	};
