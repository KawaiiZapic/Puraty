import { render } from "preact";

import App from "./pages/App";
import "./style.css";
import { initializeRouter } from "./router";
import { initConfig } from "./utils/config";
import { handleSwipe } from "./utils/swipe";

if (import.meta.env.DEV) {
	await import("preact/devtools");
	await import("preact/debug");
}

const load = async () => {
	const router = initializeRouter();
	await initConfig();
	render(h(App, { router }), document.body);
	handleSwipe(document.scrollingElement! as HTMLElement, router);
};

load();
