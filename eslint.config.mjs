// eslint.config.mjs
import globals from "globals"; // import globals for browser and node envs if needed
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigAsPlugin } from "@eslint/compat";
import eslintPluginNext from "@next/eslint-plugin-next";
import eslintPluginReact from "eslint-plugin-react";

export default tseslint.config(
  // 1. Global Ignores: Tell ESLint to completely ignore generated files
  {
    ignores: ["src/generated/**"], // This will ignore all files and subdirectories within src/generated/
  },

  // 2. Base ESLint Configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [
      // Standard ESLint recommended rules
      tseslint.configs.recommended,
      // TypeScript ESLint recommended rules
      pluginReactConfig, // Recommended React rules
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"], // Ensure this path is correct
      },
      // You might need to add specific environments for browser/node
      // For Next.js, usually `browser: true` and `node: true` are common.
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      // fixupConfigAsPlugin is often needed when integrating legacy plugins like eslint-plugin-react
      react: fixupConfigAsPlugin(eslintPluginReact),
    },
    rules: {
      // Common rules you might want to adjust
      "@typescript-eslint/no-unused-vars": "warn", // Change to "warn" from "error" if you prefer
      // "@typescript-eslint/no-require-imports": "error", // Keep this if you want to enforce ES Modules imports
      // Add or adjust other rules as needed
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },

  // 3. Next.js Specific Configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": eslintPluginNext,
    },
    rules: {
      // Recommended Next.js rules
      ...eslintPluginNext.configs.recommended.rules,
      // Web Vitals specific rules if you used "next/core-web-vitals" before
      ...eslintPluginNext.configs["core-web-vitals"].rules,
      // You can override specific Next.js rules here
      // For example:
      // "@next/next/no-img-element": "off",
    },
  },

  // 4. If you have specific rules for 'src/app' directory, keep them
  // For example, if you want stricter rules for app directory:
  // {
  //   files: ["src/app/**/*.{js,jsx,ts,tsx}"],
  //   rules: {
  //     // stricter rules for app directory
  //   }
  // }
);