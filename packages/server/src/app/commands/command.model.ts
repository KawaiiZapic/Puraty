export interface BatteryStatus {
	capacity: number;
	charging: boolean;
	support: boolean;
}

export interface BatteryHAL {
	capacity: string;
	charging: string;
}

export interface DeviceModelInfo {
	model: string;
	watchable: boolean;
	serial: string[];
}

/**
 *
 * Great thanks to bookfere provide ways to determine device model
 * https://bookfere.com/post/200.html#check_model
 *
 */

export const DeviceSerialModelMap: DeviceModelInfo[] = [
	{
		model: "KindlePaperWhite5",
		watchable: false,
		serial: [
			"G001PX",
			"G8S1PX",
			"G0021A",
			"G8S21A",
			"G002DK",
			"G8S2DK",
			"G002BJ",
			"G8S2BJ",
			"G00219",
			"G8S219",
			"G001LG",
			"G8S1LG",
			"G002BH",
			"G8S2BH"
		]
	}
];

export const BatteryHALDb: Record<string, BatteryHAL> = {
	KindlePaperWhite5: {
		capacity: "/sys/class/power_supply/bd71827_bat/capacity",
		charging: "/sys/class/power_supply/bd71827_bat/charging"
	}
};
