import { exec } from "node:child_process";
import { watch } from "node:fs/promises";
import process from "node:process";

import { context } from "esbuild";

const ctx = await context({
	target: "es2023",
	outdir: "dist",
	bundle: true,
	entryPoints: ["src/index.ts", "src/venera-lib/index.ts"],
	format: "esm",
	external: ["tjs:*"],
	logLevel: "info",
	splitting: true
});

await ctx.watch();

const watcher = watch("dist", {
	recursive: true
});
let requireReload = true;

/** @type {import("node:child_process").ChildProcess} */
let tjs = null;
setInterval(() => {
	if (!requireReload) return;
	tjs?.kill();
	requireReload = false;
	tjs = exec("tjs run index.js --api", {
		cwd: "dist",
		env: {
			DEV: 1,
			...process.env
		}
	});

	tjs.stdout.setEncoding("utf8");
	tjs.stdout.pipe(process.stdout);

	tjs.stderr.setEncoding("utf8");
	tjs.stderr.pipe(process.stderr);

	tjs.on("exit", async (e, signal) => {
		if (requireReload || signal === "SIGTERM") return;
		console.warn(`server crashed(${e ?? signal}), restarting...`);
		await new Promise(res => setTimeout(res, 1000));
		await ctx.rebuild();
		requireReload = true;
	});
}, 100);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
for await (const _ of watcher) {
	requireReload = true;
}

process.on("beforeExit", () => {
	tjs?.kill();
});
