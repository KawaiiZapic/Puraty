import App from "./pages/App";
import { router } from "./router";
import "./style.css";

const AppRoot = document.getElementById("app")!;

App().forEach(v => AppRoot.appendChild(v));

router.resolve();