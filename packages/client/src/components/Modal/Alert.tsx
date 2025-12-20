import InfoFilled from "@sicons/material/InfoFilled.svg";
import type { FunctionComponent } from "preact";

import style from "./Alert.module.css";

export const Alert: FunctionComponent<{ msg: string }> = ({ msg }) => {
	return (
		<div class={style.alertWrapper}>
			<div class={style.alertIcon}>
				<img src={InfoFilled}></img>
			</div>
			<div>{msg}</div>
		</div>
	);
};
