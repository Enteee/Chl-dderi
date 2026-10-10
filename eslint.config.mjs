import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
    // Build output, vendored data and generated code. `sw.js` and `workbox-*.js` at the root are
    // what vite-plugin-pwa emits; they are committed because the deploy publishes them.
    globalIgnores(["dist/", "assets/", "index.html", "sw.js", "workbox-*.js", "maps/", ".devenv/"]),

    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactPlugin.configs.flat.recommended,

    {
        plugins: { "react-hooks": reactHooks },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },

    prettierRecommended,

    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "react-refresh": reactRefresh,
            "unused-imports": unusedImports,
            import: importPlugin,
        },
        linterOptions: { reportUnusedDisableDirectives: true },
        languageOptions: {
            globals: { ...globals.browser },
            parser: tsParser,
            parserOptions: { projectService: true, ecmaFeatures: { jsx: true } },
        },
        settings: {
            react: { version: "detect" },
            "import/resolver": {
                typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
                node: { extensions: [".js", ".jsx", ".ts", ".tsx", ".css"] },
            },
        },
        rules: {
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "react/function-component-definition": [
                "error",
                { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
            ],
            "react/react-in-jsx-scope": "off",
            // The mappack format is deliberately open (additionalProperties: true), so the
            // parsing layer has to accept values it cannot type yet.
            "@typescript-eslint/no-explicit-any": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "import/extensions": [
                "error",
                "ignorePackages",
                { js: "never", jsx: "never", ts: "never", tsx: "never" },
            ],
            quotes: ["error", "double", { avoidEscape: true }],
            "prefer-const": "error",
            "prettier/prettier": ["error"],
            "func-style": ["error", "expression"],
            "import/no-unresolved": "error",
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: "typeLike", format: ["PascalCase"] },
                {
                    selector: "variable",
                    format: ["camelCase", "UPPER_CASE", "PascalCase"],
                    leadingUnderscore: "allow",
                },
                { selector: "function", format: ["camelCase", "PascalCase"] },
                {
                    selector: "parameter",
                    format: ["camelCase", "PascalCase"],
                    leadingUnderscore: "allow",
                    trailingUnderscore: "allow",
                },
                { selector: "parameter", filter: { regex: "^_+$", match: true }, format: null },
                // Mappack fields are short and come from the data, not from us.
                { selector: "objectLiteralProperty", format: null },
                { selector: "typeProperty", format: null },
            ],
        },
    },

    {
        files: ["*.config.{js,mjs,ts}", "vite.config.ts", "tools/**/*.ts"],
        languageOptions: { globals: { ...globals.node }, parser: tsParser },
        settings: { react: { version: "detect" } },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
            "import/no-unresolved": "off",
        },
    },
]);
