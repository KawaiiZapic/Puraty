import { Controller, Get, Json, Patch } from "@/utils/decorators";

import { MainService } from "./app.service";

@Controller()
export class MainController {
	@Get("/config")
	async config() {
		return MainService.getConfig();
	}

	@Patch("/config")
	async modifyConfig(@Json body: Record<string, unknown>) {
		const ignoredKeys = await MainService.applyNewConfig(body);
		return { ignoredKeys };
	}
}
