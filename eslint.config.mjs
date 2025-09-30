import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Apply rules to all TypeScript and JavaScript files, excluding build/generated files
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "__tests__/coverage/**",
      "*.config.js",
      "*.config.mjs"
    ],
    rules: {
      "@next/next/no-img-element": "off",
      // Indentation rules - use 4 spaces consistently
      "indent": ["error", 4, {
        "SwitchCase": 1,
        "VariableDeclarator": 1,
        "outerIIFEBody": 1,
        "MemberExpression": 1,
        "FunctionDeclaration": { "parameters": 1, "body": 1 },
        "FunctionExpression": { "parameters": 1, "body": 1 },
        "CallExpression": { "arguments": 1 },
        "ArrayExpression": 1,
        "ObjectExpression": 1,
        "ImportDeclaration": 1,
        "flatTernaryExpressions": false,
        "offsetTernaryExpressions": false,
        "ignoredNodes": [
          "TemplateLiteral *",
          "JSXElement",
          "JSXElement > *",
          "JSXAttribute",
          "JSXIdentifier",
          "JSXNamespacedName",
          "JSXMemberExpression",
          "JSXSpreadAttribute",
          "JSXExpressionContainer",
          "JSXOpeningElement",
          "JSXClosingElement",
          "JSXText",
          "JSXEmptyExpression",
          "JSXSpreadChild"
        ]
      }],
      "@typescript-eslint/indent": "off", // Disable TS indent rule to avoid conflicts
    }
  },
  {
    // Special rules for test files - allow 'any' types in mocks and test utilities
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx", "**/__mocks__/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off" // Allow 'any' in test files and mocks
    }
  }
];

export default eslintConfig;
