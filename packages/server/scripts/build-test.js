import { rmSync } from "node:fs";

import { buildSync } from "esbuild";

try {
	rmSync("dist/tests", { recursive: true });
} catch {}

buildSync({
	target: "es2023",
	bundle: true,
	entryPoints: ["tests/**/*.test.ts"],
	external: ["tjs:*"],
	outdir: "dist/tests",
	entryNames: "test-[hash]-[name]",
	sourcemap: true,
	format: "esm"
});

// Sometimes file system is not flushed, cause some tests is not found by tjs and being skipped
await new Promise(r =>
	setTimeout(() => {
		r();
	}, 500)
);
