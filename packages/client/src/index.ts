import { render, options } from "preact";

import App from "./pages/App";
import "./style.css";
import { initializeRouter } from "./router";
import { initConfig } from "./utils/config";
import { handleSwipe } from "./utils/swipe";

if (import.meta.env.DEV) {
	await import("preact/debug");
}

const load = async () => {
	const config = await initConfig();
	if (config.debugEnableSlowRendering) {
		/* Simulation of eInk screen respond speed by delay rendering */
		let timer = 0;
		const origDebounceRendering = options.debounceRendering;

		options.debounceRendering = process => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				origDebounceRendering?.(process);
			}, 300);
		};
	}
	const router = initializeRouter();
	render(h(App, { router }), document.body);
	handleSwipe(document.scrollingElement! as HTMLElement, router);
};

load();
