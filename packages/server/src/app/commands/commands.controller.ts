import { HTTPError } from "h3";

import { Controller, Delete, Post } from "@/utils/decorators";
import { env } from "@/utils/env";
import { requestExitFullscreen, requestFullscreen } from "@/utils/process";

export const ac = new AbortController();

@Controller("/command")
export class CommandHandler {
	@Post("/exit")
	exit() {
		if (!env.DEV) {
			ac.abort();
		} else {
			throw new HTTPError("Exit command is ignore in dev mode", {
				status: 500
			});
		}
	}

	@Post("/fullscreen")
	fullscreen() {
		if (env.DEV) return;
		requestFullscreen();
	}

	@Delete("/fullscreen")
	exitFullscreen() {
		if (env.DEV) return;
		requestExitFullscreen();
	}
}
