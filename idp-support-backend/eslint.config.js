import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

import { defineConfig } from "eslint";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,ts,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-undef": "error",
    },
  },
  ...tseslint.configs.recommended,
]);
