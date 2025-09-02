import { H3 } from "h3";
import { serve } from "h3-txikijs-adapter";
import initialize from "./utils/initialize";

await initialize();

const PURATY_VERSION = "0.1.0";
const app = new H3();

app.get("/", () => {
  return {
    version: PURATY_VERSION
  };
});

serve(app);