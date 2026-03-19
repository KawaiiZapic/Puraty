import { render, options } from "preact";

import api from "./api";
import App from "./pages/App";
import "./style.css";
import { initializeRouter } from "./router";
import { handleSwipe } from "./utils/swipe";

import "virtual:uno.css";

if (import.meta.env.DEV) {
	await import("preact/debug");
}

const load = async () => {
	const config = await api.App.config();
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
	const sources = await api.ComicSource.list();
	render(h(App, { router, config, sources }), document.body);
	handleSwipe(document.scrollingElement! as HTMLElement, router);
};

load();
