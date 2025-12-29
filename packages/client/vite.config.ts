import path from "node:path";

import preact from "@preact/preset-vite";
import autoprefixer from "autoprefixer";
import unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
	return {
		plugins: [
			unocss(),
			preact({
				babel: {
					plugins: [["./plugins/BabelTransformIf"]]
				}
			}),
			AutoImport({
				imports: [
					{
						from: "@/utils/TypedUseState",
						imports: ["useState", "useReducer"]
					},
					{
						from: "preact",
						imports: ["createContext", "createRef", "Fragment", "h"]
					},
					{
						from: "preact/hooks",
						imports: [
							"useCallback",
							"useMemo",
							"useEffect",
							"useRef",
							"useContext"
						]
					},
					{
						from: "@/router",
						imports: ["useRouter", "useRoute", "RouteLink"]
					},
					{
						from: "@/utils/if",
						imports: ["If"]
					}
				],
				dts: "src/types/auto-imports.d.ts"
			})
		],
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
				},
				{
					find: "navigo",
					replacement: "navigo/lib/es"
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
