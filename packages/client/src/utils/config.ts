import type { AppConfig } from "@puraty/server";

import api from "@/api";

let config: AppConfig;

export const initConfig = async () => {
	const v = await api.App.config();
	return (config = v);
};

export const getConfig = () => {
	return Object.freeze(config);
};
