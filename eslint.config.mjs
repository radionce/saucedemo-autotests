import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['playwright-report/', 'test-results/', 'blob-report/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  { files: ['tests/**/*.ts'], ...playwright.configs['flat/recommended'] },
  prettier,
);
