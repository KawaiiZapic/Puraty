export interface AppConfig {
	httpProxy: string;
}

export const defaultValues: AppConfig = {
	httpProxy: ""
};

export const configValidator: Record<keyof AppConfig, (v: unknown) => boolean> =
	{
		httpProxy: (v: unknown) =>
			typeof v === "string" && (/^https?:\/\/.*?:\d{1,5}/.test(v) || v === "")
	};
