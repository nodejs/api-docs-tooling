import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { languageOptions: { globals: globals.node } },
  // Visit https://eslint.org/docs/latest/rules to learn more about these rules
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
