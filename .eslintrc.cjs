module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "*.js", "*.mjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
  },
  overrides: [
    {
      files: ["apps/web/src/**/*.tsx", "apps/web/src/**/*.ts"],
      extends: ["plugin:react-hooks/recommended"],
      plugins: ["react-hooks", "react-refresh"],
      rules: {
        "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }],
      },
    },
  ],
}
