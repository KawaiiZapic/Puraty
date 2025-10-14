// @ts-check

import { defineConfig } from "eslint/config";

import ESLintConfig from "../tools/eslint.browser.config.mjs";

export default defineConfig(...ESLintConfig, {
	ignores: ["dist/**/*"]
});
