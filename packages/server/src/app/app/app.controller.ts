import { AppData } from "@/db/AppData";
import { Controller, Get, Json, Patch } from "@/utils/decorators";

import { defaultValues, type AppConfig } from "./app.model";
import { MainService } from "./app.service";

@Controller()
export class MainController {
	@Get("/config")
	async config() {
		return {
			...defaultValues,
			...AppData.getAll()
		} as AppConfig;
	}

	@Patch("/config")
	async modifyConfig(@Json body: Record<string, unknown>) {
		const ignoredKeys = await MainService.applyNewConfig(body);
		return { ignoredKeys };
	}
}
