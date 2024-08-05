import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // @see https://eslint.org/docs/latest/use/configure/configuration-files#specifying-files-and-ignores
  {
    files: ['src/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  // @see https://eslint.org/docs/latest/use/configure/configuration-files#specifying-files-and-ignores
  {
    files: ['src/generators/legacy-html/assets/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
  // @see https://eslint.org/docs/latest/rules to learn more about these rules
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
