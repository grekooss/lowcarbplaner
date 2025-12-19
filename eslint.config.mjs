import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.mjs",
      ".gemini-design/**",
      ".ai/**",
      ".claude/**",
      "scripts/**",
      "proxy.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:@typescript-eslint/recommended", "prettier"),
  {
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error", // Changed from warn to error
      "@typescript-eslint/explicit-function-return-type": "off", // Allow inference
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React rules
      "react/self-closing-comp": "error", // Changed from warn to error
      "react-hooks/exhaustive-deps": "warn",

      // General quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
    },
  },
  // Relaxed rules for test files
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx", "src/**/__tests__/**/*.ts", "src/**/__tests__/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Allow any in tests
      "@typescript-eslint/no-unused-vars": "warn", // Allow unused vars in tests
      "@typescript-eslint/no-non-null-assertion": "off", // Allow non-null assertions in tests
      "no-console": "off", // Allow console in tests
    },
  },
];

export default eslintConfig;
