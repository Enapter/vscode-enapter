// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    ignores: ["dist/**/*.ts", "dist/**", "**/*.mjs", "eslint.config.mjs", "**/*.js", "src/webview/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/test/**/*.ts", "**/tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
