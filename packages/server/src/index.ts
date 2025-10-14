import "./utils/polyfills";
import { App } from "./app";
import { ac } from "./app/commands/commands.controller";
import initialize from "./utils/initialize";
import { launchUI } from "./utils/process";

await initialize();
const app = new App();

app.serve(ac.signal);
launchUI(ac.signal);
