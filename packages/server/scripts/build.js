import { buildSync } from "esbuild";
import { rmSync } from "node:fs";

try {
  rmSync("dist", { recursive: true })
} catch(e) {}

buildSync({
  target: "es2023",
  outdir: "dist",
  bundle: true,
  entryPoints: [
    "src/index.ts",
    "src/venera-lib/index.ts"
  ],
  format: "esm",
  external: ["tjs:*"],
  logLevel: "info",
  splitting: true
});