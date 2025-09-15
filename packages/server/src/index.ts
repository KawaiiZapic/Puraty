import { launchUI } from "./utils/process";

import initialize from "./utils/initialize";
import { ac } from "./app/commands/commands.controller";
import { App } from "./app";

await initialize();
const app = new App();

app.serve(ac.signal);
launchUI(ac.signal);
