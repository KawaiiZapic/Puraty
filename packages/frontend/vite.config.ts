import { defineConfig } from "vite";
import path from "node:path";
import autoprefixer from "autoprefixer";

export default defineConfig(() => {
  return {
    "base": "",
    build: {
      minify: false,
      target: "chrome75"
    },
    resolve: {
      alias: [
				{
					find: "@",
					replacement: path.resolve("src")
				}
      ]
    },
    css: {
      postcss: {
        plugins: [autoprefixer({})]
      }
    }
  };
});