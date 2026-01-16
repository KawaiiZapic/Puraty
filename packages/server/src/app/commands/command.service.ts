import {
	BatteryHALDb,
	DeviceSerialModelMap,
	type BatteryHAL,
	type BatteryStatus,
	type DeviceModelInfo
} from "./command.model";

export class CommandService {
	static DeviceModel: DeviceModelInfo | null = null;
	static lastBatteryStatus: BatteryStatus | null = null;
	static hasBatteryMonitorInitialized = false;

	static async getDeviceModelInfo() {
		if (!this.DeviceModel) {
			try {
				const serial = new TextDecoder().decode(
					await tjs.readFile("/proc/usid")
				);
				const model = DeviceSerialModelMap.find(model => {
					return model.serial.some(s => serial.startsWith(s));
				});
				if (!model) {
					throw new Error("Unknown device model");
				}
				this.DeviceModel = model;
			} catch {
				this.DeviceModel = {
					model: "Unknown",
					watchable: false,
					serial: []
				};
			}
		}
		return this.DeviceModel;
	}

	static async initBatteryStatusMonitor(HAL: BatteryHAL) {
		if (this.hasBatteryMonitorInitialized) {
			return;
		}
		const update = async () => {
			this.lastBatteryStatus = await CommandService.readBatteryStatus(HAL);
		};
		tjs.watch(HAL.capacity, update);
		tjs.watch(HAL.charging, update);

		await update();
		this.hasBatteryMonitorInitialized = true;
	}

	static async readBatteryStatus(HAL: BatteryHAL) {
		if (!HAL) {
			return {
				capacity: 0,
				charging: false,
				support: false
			};
		}
		const capacity = parseInt(
			new TextDecoder().decode(await tjs.readFile(HAL.capacity)).trim()
		);
		const charging =
			new TextDecoder().decode(await tjs.readFile(HAL.charging)).trim() === "1";
		return {
			capacity,
			charging,
			support: true
		};
	}

	static async getBattery(): Promise<BatteryStatus> {
		const model = await this.getDeviceModelInfo();
		const HAL = BatteryHALDb[model.model];
		if (model.watchable) {
			await this.initBatteryStatusMonitor(HAL);
			return this.lastBatteryStatus!;
		}
		return this.readBatteryStatus(HAL);
	}
}
