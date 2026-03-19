import type { AppConfig } from "@puraty/server";
import type { Dispatch, StateUpdater } from "preact/hooks";

export const ConfigContext = createContext<
	[Readonly<AppConfig>, Dispatch<StateUpdater<AppConfig>>]
>(null as never);

export const useConfig = () => {
	return useContext(ConfigContext)[0];
};

export const useConfigUpdater = () => {
	return useContext(ConfigContext)[1];
};
