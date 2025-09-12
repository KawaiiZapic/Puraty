import { context } from "esbuild";
import { watch } from "node:fs/promises";
import { exec } from "node:child_process";
import process from "node:process";

const ctx = await context({
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
  splitting: true,
  
});

await ctx.watch();

const watcher = watch("dist", {
  recursive: true
});
let requireReload = true;

let tjs = null;
setInterval(() => {
  if (!requireReload) return;
  requireReload = false;
  tjs?.kill();
  tjs = exec("tjs run index.js --api", {
    cwd: "dist",
    env: {
      DEV: 1,
      ...process.env
    }
  });

  tjs.stdout.setEncoding('utf8');
  tjs.stdout.pipe(process.stdout);

  tjs.stderr.setEncoding('utf8');
  tjs.stderr.pipe(process.stderr);
  tjs.on("exit", (code) => {
    exit(code);
  });
}, 100);

for await (const _ of watcher) {
  requireReload = true;
}

process.on("beforeExit", () => {
  tjs?.kill();
});