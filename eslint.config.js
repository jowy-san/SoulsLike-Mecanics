import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const node = { process: 'readonly', console: 'readonly', require: 'readonly', __dirname: 'readonly' };

export default tseslint.config(
  { ignores: ['dist', 'artifacts', 'test-results', 'playwright-report'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['electron/**', 'scripts/**'], languageOptions: { globals: node } },
  { files: ['electron/**/*.cjs'], languageOptions: { sourceType: 'commonjs' }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
);
