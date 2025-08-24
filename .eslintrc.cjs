module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:security/recommended',
    'prettier',
  ],
  parserOptions: { sourceType: 'module', ecmaVersion: 'latest' },
  ignorePatterns: ['dist', 'coverage', '**/*.d.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
};


