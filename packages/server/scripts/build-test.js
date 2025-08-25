import { buildSync } from "esbuild";
import { rmSync } from "node:fs";

try {
  rmSync("dist/tests", { recursive: true })
} catch(e) {}

buildSync({
  target: "es2023",
  bundle: true,
  entryPoints: [
    "tests/**/*.test.ts"
  ],
  external: ["tjs:*"],
  outdir: "dist/tests",
  entryNames: "test-[hash]-[name]",
  format: "esm"
});

// Sometimes file system is not flushed, cause some tests is not found by tjs and being skipped
await new Promise(r => setTimeout(() => {r()}, 500));