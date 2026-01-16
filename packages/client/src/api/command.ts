import type { CommandHandler } from "@puraty/server";

import { Req } from ".";

export const Command = {
	exit: () => {
		return Req.post<void>("/api/command/exit");
	},
	fullscreen() {
		return Req.post<void>("/api/command/fullscreen");
	},
	exitFullscreen() {
		return Req.delete<void>("/api/command/fullscreen");
	},
	battery() {
		return Req.get("/api/command/battery");
	}
} satisfies CommandHandler;
