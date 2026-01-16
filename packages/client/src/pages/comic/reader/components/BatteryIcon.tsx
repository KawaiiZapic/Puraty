import type { BatteryStatus } from "@puraty/server";
import QuestionMarkFilled from "@sicons/material/QuestionMarkFilled.svg";
import type { FunctionComponent } from "preact";

import api from "@/api";

import style from "./BatteryIcon.module.css";

let lastStatus: BatteryStatus | undefined = undefined;

export const UpdateBatteryStatus = async () => {
	const res = await api.Command.battery();
	lastStatus = res;
};

export const BatteryIcon: FunctionComponent = () => {
	const [battery, setBattery] = useState<BatteryStatus | undefined>(
		() => lastStatus
	);

	useEffect(() => {
		if (lastStatus?.support === false) {
			return;
		}
		const update = () => {
			UpdateBatteryStatus().then(() => {
				setBattery(lastStatus);
			});
		};
		const int = setInterval(update, 2000);
		update();
		return () => {
			clearInterval(int);
		};
	}, []);

	return (
		<span class={`${style.batteryIcon} flex items-center`}>
			{If(battery && battery.support)(
				<span class="text-0.65rem line-height-0 mr-1">
					{battery!.capacity}% {battery!.charging ? "+" : ""}
				</span>
			).End()}
			<span class={style.wrapper}>
				{If(battery && battery.support)(
					<span
						class={style.inner}
						style={{
							width: `${battery!.capacity}%`
						}}
					/>
				).Else(
					<span
						class={style.iconStatus}
						style={{
							"--icon": `url("${QuestionMarkFilled}")`
						}}
					></span>
				)}
			</span>
		</span>
	);
};
