module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "@concertjs/concertjs"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    browser: true,
    es2021: true
  },
  rules: {
    "@concertjs/concertjs/jsx-attrs": "warn"
  }
};
