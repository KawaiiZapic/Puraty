import path from "tjs:path";

import { env } from "./env";

const exists = async (path: string) => {
	try {
		await tjs.stat(path);
		return true;
	} catch {
		return false;
	}
};

export const launchUI = async (signal?: AbortSignal) => {
	if (env.DEV || (await exists(path.join(APP_DIR, "browser.pid")))) return;
	const p = tjs.spawn(
		[
			"/usr/bin/chromium/bin/kindle_browser",
			"--no-zygote",
			"--no-sandbox",
			"--single-process",
			"--skia-resource-cache-limit-mb=64",
			"--disable-gpu",
			"--in-process-gpu",
			"--disable-gpu-sandbox",
			"--disable-gpu-compositing",
			"--enable-dom-distiller",
			"--enable-distillability-service",
			"--force-device-scale-factor=1.25",
			"--js-flags=jitless",
			"--content-shell-hide-toolbar",
			"--force-gpu-mem-available-mb=40",
			"--enable-low-end-device-mode",
			"--enable-low-res-tiling",
			"--disable-site-isolation-trials",
			"--enable-grayscale-mode",
			"http://localhost:3000"
		],
		{
			env: {
				SHLVL: "1",
				LD_LIBRARY_PATH:
					"/usr/bin/chromium/lib:/usr/bin/chromium/usr/lib:/usr/lib/",
				DISPLAY: ":0.0",
				LANG: "zh_CN.utf8",
				XDG_CONFIG_HOME: "/mnt/us/extensions/Puraty/data/",
				LC_ALL: "zh_CN.utf8",
				KINDLE_TZ: "Asia/Chongqing"
			},
			cwd: "/",
			stdout: "ignore",
			stderr: "ignore"
		}
	);
	signal?.addEventListener("abort", () => {
		p.kill();
	});
	const f = await tjs.open(path.join(APP_DIR, "browser.pid"), "w");
	await f.write(new TextEncoder().encode(p.pid.toString()));
	await f.close();
	return p;
};

export const findUIWindowId = async () => {
	const finder = tjs.spawn([path.join(APP_DIR, "..", "bin/wmctrl"), "-l"], {
		stdout: "pipe"
	});
	if (!finder.stdout) return undefined;
	const buf = new Uint8Array(1024);
	await finder.stdout.read(buf);
	const lines = new TextDecoder().decode(buf).split("\n");
	return lines
		.find(line => line.includes("com.lab126.browser"))
		?.split(" ")?.[0];
};

export const requestExitFullscreen = async () => {
	const id = await findUIWindowId();
	if (!id) return;
	for (let i = 0; i < 10; i++) {
		tjs.spawn([
			path.join(APP_DIR, "..", "bin/wmctrl"),
			"-i",
			"-r",
			id,
			"-N",
			"L:A_N:application_PC:T_ID:com.lab126.browser_WT:true"
		]);
		await new Promise(res => setTimeout(res, 100));
	}
};

export const requestFullscreen = async () => {
	const id = await findUIWindowId();
	if (!id) return;
	for (let i = 0; i < 10; i++) {
		tjs.spawn([
			path.join(APP_DIR, "..", "bin/wmctrl"),
			"-i",
			"-r",
			id,
			"-N",
			"L:A_N:application_PC:N_ID:com.lab126.browser_WT:true"
		]);
		await new Promise(res => setTimeout(res, 100));
	}
};
