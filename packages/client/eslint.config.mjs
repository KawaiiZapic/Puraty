// @ts-check

import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import ESLintConfig from "../tools/eslint.browser.config.mjs";

export default defineConfig(
	...ESLintConfig,
	react.configs.flat.recommended,
	reactHooks.configs.flat.recommended,
	{
		rules: {
			// Handle by build process
			"react/react-in-jsx-scope": "off",
			// Enforce by Typescript
			"react/jsx-no-undef": "off",
			"react/no-unknown-property": "off",
			"react/prop-types": "off",
			"react-hooks/immutability": "off",
			// Too many false positives
			"react-hooks/exhaustive-deps": "off"
		}
	},
	{
		ignores: ["dist/**/*"]
	}
);
