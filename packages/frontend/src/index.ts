import App from "./pages/App";
import { router } from "./router";
import "./style.css";

const AppRoot = document.getElementById("app")!;

AppRoot.appendChild(App());

router.resolve();