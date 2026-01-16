import { Controller, Delete, Get, Post } from "@/utils/decorators";
import { env } from "@/utils/env";
import { createHttpError } from "@/utils/error";
import { requestExitFullscreen, requestFullscreen } from "@/utils/process";

import type { BatteryStatus } from "./command.model";
import { CommandService } from "./command.service";

export const ac = new AbortController();

@Controller("/command")
export class CommandHandler {
	@Post("/exit")
	exit() {
		if (!env.DEV) {
			ac.abort();
		} else {
			throw createHttpError(500, "Exit command is ignore in dev mode");
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

	@Get("/battery")
	async battery(): Promise<BatteryStatus> {
		if (env.DEV) {
			return {
				capacity: Math.floor(Math.random() * 100),
				charging: Math.random() > 0.5,
				support: true
			};
		}
		return CommandService.getBattery();
	}
}
