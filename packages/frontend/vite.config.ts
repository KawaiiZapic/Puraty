import path from "node:path";

import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";

export default defineConfig(() => {
	return {
		base: "",
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
		},
		server: {
			proxy: {
				"/api": "http://localhost:3000/"
			}
		}
	};
});
