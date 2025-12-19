import App from "./pages/App";
import { router } from "./router";
import "./style.css";
import { initConfig } from "./utils/config";
import { handleSwipe } from "./utils/swipe";

const load = async () => {
	const AppRoot = document.body;
	AppRoot.appendChild(App());
	router.ready();

	initConfig();

	handleSwipe(document.scrollingElement! as HTMLElement);
};

load();
