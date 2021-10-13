module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:promise/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "import", "promise"],
  rules: {
    "prettier/prettier": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
  ignorePatterns: ["node_modules", "dist"],
  settings: {
    "import/resolver": "typescript",
  },
};
