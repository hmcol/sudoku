module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:react/recommended",
    ],
    overrides: [],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "react"],
    rules: {
        semi: ["error", "always"],
        "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
        "no-constant-condition": ["error", { checkLoops: false }],
        "@typescript-eslint/no-unnecessary-condition": [
            "error",
            { allowConstantLoopConditions: true },
        ],
        // "comma-dangle": ["error", "always-multiline"],
    },
    ignorePatterns: "**/*.js",
};
