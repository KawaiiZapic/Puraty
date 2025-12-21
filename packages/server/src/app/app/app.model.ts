export interface AppConfig {
	httpProxy: string;
	readerPreloadPages: number;
	debugEnableSlowRendering: boolean;
	debugEnableChromiumRemoteDebug: boolean;
}

export const defaultValues: AppConfig = {
	httpProxy: "",
	readerPreloadPages: 3,
	debugEnableSlowRendering: false,
	debugEnableChromiumRemoteDebug: false
};

export const configValidator: Partial<
	Record<keyof AppConfig, (v: unknown) => boolean>
> = {
	httpProxy: v =>
		typeof v === "string" && (/^https?:\/\/.*?:\d{1,5}/.test(v) || v === ""),
	readerPreloadPages: v =>
		typeof v === "number" && Number.isInteger(v) && v > 0 && v < 15,
	debugEnableSlowRendering: v => typeof v === "boolean",
	debugEnableChromiumRemoteDebug: v => typeof v === "boolean"
};
