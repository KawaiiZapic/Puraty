import type { MainController } from "@puraty/server";

import { Req } from ".";

export const App = {
	config: async () => {
		return Req.get("/api/config");
	},
	modifyConfig: async (body: Record<string, unknown>) => {
		return Req.patch("/api/config", body);
	}
} satisfies MainController;
