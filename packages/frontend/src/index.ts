import App from "./pages/App";
import { router } from "./router";
import "./style.css";
import { handleSwipe } from "./utils/swipe";

const AppRoot = document.body;

router.resolve();
AppRoot.appendChild(App());

handleSwipe(document.scrollingElement! as HTMLElement);
