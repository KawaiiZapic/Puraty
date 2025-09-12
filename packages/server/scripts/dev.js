import { context } from "esbuild";
import { watch } from "node:fs/promises";
import { exec } from "node:child_process";
import { stdout, stderr, env, exit } from "node:process";

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

process = null;
setInterval(() => {
  if (!requireReload) return;
  requireReload = false;
  process?.kill();
  process = exec("tjs run index.js --api", {
    cwd: "dist",
    env: {
      DEV: 1,
      ...env
    }
  });

  process.stdout.setEncoding('utf8');
  process.stdout.pipe(stdout);

  process.stderr.setEncoding('utf8');
  process.stderr.pipe(stderr);
  process.on("exit", (code) => {
    exit(code);
  });
}, 100);

for await (const _ of watcher) {
  requireReload = true;
}