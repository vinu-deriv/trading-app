module.exports = {
    plugins: ['solid', 'prettier'],
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['google', 'eslint:recommended', 'plugin:solid/recommended', 'plugin:prettier/recommended'],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'no-console': 'error',
        'no-empty': 'error',
        'no-irregular-whitespace': 'error',
        'prettier/prettier': 'error',
        "no-debugger": 'error',
        'object-curly-spacing': 0,
        "require-jsdoc" : 0
    },
};
