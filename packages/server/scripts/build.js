import { buildSync } from "esbuild";

buildSync({
  target: "es2023",
  outdir: "dist",
  bundle: true,
  entryPoints: [
    "src/index.ts"
  ],
  logLevel: "info"
});