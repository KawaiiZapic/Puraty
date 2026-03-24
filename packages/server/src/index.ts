import "./utils/polyfills";
import { App } from "./app";
import { ac } from "./app/commands/commands.controller";
import initialize from "./utils/initialize";
import { createLogger } from "./utils/logger";
import { launchUI } from "./utils/process";

await initialize();
const app = new App();
const logger = createLogger("Main");

app.serve(ac.signal);
launchUI(ac.signal);
logger.info("Server started at http://localhost:3000");

globalThis.addEventListener("unhandledrejection", event => {
	logger.error("Unhandled rejection caught:", event.reason);
	event.preventDefault();
});
