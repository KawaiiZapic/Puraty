import App from "./pages/App";
import { router } from "./router";
import "./style.css";

const AppRoot = document.getElementById("app")!;

router.resolve();
App().forEach(v => AppRoot.appendChild(v));