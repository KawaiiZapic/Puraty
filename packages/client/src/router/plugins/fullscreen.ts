import type { RouterPlugin } from "../router";
import api from "@/api";

declare global {
	interface RouteMeta {
		fullscreen: boolean;
	}
}

export default (router => {
	let isCurrentFullscreen = false;
	router.onEnter(() => {
		const fs = router.current?.meta?.fullscreen ?? false;
		if (fs === true && !isCurrentFullscreen) {
			document.documentElement.classList.add("fullscreen");
			api.Command.fullscreen();
		} else if (isCurrentFullscreen) {
			document.documentElement.classList.remove("fullscreen");
			api.Command.exitFullscreen();
		}
		isCurrentFullscreen = fs;
	});
}) satisfies RouterPlugin;
