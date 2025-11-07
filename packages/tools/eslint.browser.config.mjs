import ESLintJS from "@eslint/js";
import { defineConfig } from "eslint/config";
import ImportPlugin from "eslint-plugin-import";
import globals from "globals";
import TypeScriptESLint from "typescript-eslint";


export default defineConfig(
  {
    ignores: [
      "dist/**/*",
      "data/**/*",
    ]
  },
   ESLintJS.configs.recommended,
  ...TypeScriptESLint.configs.recommended,
  ImportPlugin.flatConfigs.recommended,
  ImportPlugin.flatConfigs.typescript,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-mixed-spaces-and-tabs": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      eqeqeq: ["warn", "smart"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          caughtErrorsIgnorePattern: "^_$",
        },
      ],
      "import/no-unresolved": "off",
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "@/**",
              group: "parent",
            },
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
        },
      ],
      "import/newline-after-import": [
        "warn",
        {
          count: 1,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
        },
      ],
    },
    settings: {
      "import/extensions": [".js"],
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      }
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
			globals: {
				...globals.es2022,
        ...globals.worker
			}
    }
  }
);
