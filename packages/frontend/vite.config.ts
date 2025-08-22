import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import autoprefixer from "autoprefixer";

export default defineConfig(() => {
  return {
    plugins: [
      legacy({
        renderModernChunks: false,
        targets: "safari 5"
      })
    ],
    "base": "",
    build: {
      minify: false
    },
    css: {
      postcss: {
        plugins: [autoprefixer({})]
      }
    }
  };
});