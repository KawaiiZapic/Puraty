import App from "./pages/App";
import { router } from "./router";
import "./style.css";

const AppRoot = document.body;

router.resolve();
AppRoot.appendChild(App());