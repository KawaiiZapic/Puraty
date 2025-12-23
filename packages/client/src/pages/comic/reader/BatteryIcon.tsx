import QuestionMarkFilled from "@sicons/material/QuestionMarkFilled.svg";
import type { FunctionComponent } from "preact";

import style from "./BatteryIcon.module.css";

export const BatteryIcon: FunctionComponent<{
	capacity?: number;
}> = ({ capacity }) => {
	return (
		<span class={style.batteryIcon}>
			{If(typeof capacity === "number")(<span>{capacity}%</span>).End()}
			<span class={style.wrapper}>
				{If(typeof capacity === "number")(
					<span
						class={style.inner}
						style={{
							width: `${capacity}%`
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
