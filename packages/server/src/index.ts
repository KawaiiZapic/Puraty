import { H3 } from "h3";
import { serve } from "h3-txikijs-adapter";
import { launchUI } from "./utils/process";

import initialize from "./utils/initialize";
import statics from "./routes/statics";
import commands, { ac } from "./routes/commands";
import comicSources from "./routes/comic-sources";

await initialize();

const app = new H3();

[
  statics,
  commands,
  comicSources
].forEach(handler => handler(app));

launchUI(ac.signal);
serve(app, {
  signal: ac.signal
});
