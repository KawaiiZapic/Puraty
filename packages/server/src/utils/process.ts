export const startBrowser = (signal?: AbortSignal) => {
  runWmctrl();
  const p = tjs.spawn([
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
      "--force-device-scale-factor=1",
      "--js-flags=jitless",
      "--content-shell-hide-toolbar",
      "--force-gpu-mem-available-mb=40",
      "--enable-low-end-device-mode",
      "--enable-low-res-tiling",
      "--disable-site-isolation-trials",
      "--enable-grayscale-mode",
      "http://localhost:3000"
  ], {
    env: {
      SHLVL: "1",
      LD_LIBRARY_PATH: "/usr/bin/chromium/lib:/usr/bin/chromium/usr/lib:/usr/lib/",
      DISPLAY: ":0.0",
      LANG: "zh_CN.utf8",
      XDG_CONFIG_HOME: "/mnt/us/extensions/Puraty/data/",
      LC_ALL: "zh_CN.utf8",
      KINDLE_TZ: "Asia/Chongqing"
    },
    cwd: "/"
  });
  signal?.addEventListener("abort", () => {
    p.kill();
  })
  return p;
}

export const runWmctrl = () => {
  const int = setInterval(() => {
    tjs.spawn([
      "/mnt/us/extensions/Puraty/bin/wmctrl",
        "-r",
        "L:A_N:application_PC:TS_ID:com.lab126.browser_WT:true",
        "-N",
        "L:A_N:application_ID:com.lab126.browser_WT:true"
    ])
  }, 500);
  setTimeout(() => {
    clearInterval(int);
  }, 5000);
}