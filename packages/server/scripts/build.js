import { rmSync } from "node:fs";

import { buildSync } from "esbuild";

try {
	rmSync("dist", { recursive: true });
} catch {}

buildSync({
	target: "es2023",
	outdir: "dist",
	bundle: true,
	entryPoints: ["src/index.ts", "src/venera-lib/index.ts"],
	format: "esm",
	external: ["tjs:*"],
	logLevel: "info",
	splitting: true
});
