import { createElement, render } from "preact";

import App from "./pages/App";
import "./style.css";
import { initConfig } from "./utils/config";

const load = async () => {
	const AppRoot = document.body;
	render(createElement(App, {}), AppRoot);

	initConfig();

	// handleSwipe(document.scrollingElement! as HTMLElement);
};

load();
