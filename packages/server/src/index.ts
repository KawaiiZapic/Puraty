import { H3 } from "h3";
import { serve } from "h3-txikijs-adapter";
import { launchUI } from "./utils/process";

import initialize from "./utils/initialize";
import statics from "./routes/statics";
import { ac } from "./routes/commands";
import "./routes/comic-sources";
import { applyHandler } from "./utils/decorator";

await initialize();

const app = new H3();

[
  statics
].forEach(handler => handler(app));

applyHandler(app);

launchUI(ac.signal);
serve(app, {
  signal: ac.signal
});
