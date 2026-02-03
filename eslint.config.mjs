import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config({
  files: ['src/**/*.ts', 'test/**/*.ts'],
  extends: [tseslint.configs.base],
  plugins: {
    '@stylistic': stylistic,
  },
  rules: {
    '@stylistic/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
    ],
  },
});