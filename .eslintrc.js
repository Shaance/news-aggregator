module.exports = {
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    "import/extensions" : 0,
    "@typescript-eslint/no-use-before-define": 0,
  }
};