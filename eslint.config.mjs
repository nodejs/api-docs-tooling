import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  // @see https://eslint.org/docs/latest/use/configure/configuration-files#specifying-files-and-ignores
  {
    files: ['src/**/*.mjs', 'bin/cli.mjs'],
    plugins: {
      jsdoc: jsdoc,
    },
    languageOptions: { globals: globals.node },
    rules: {
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      'jsdoc/require-param': 'error',
    },
  },
  // Override rules for test files to disable JSDoc rules
  {
    files: ['src/**/*.test.mjs'],
    rules: {
      'jsdoc/check-alignment': 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
    },
  },
  // @see https://eslint.org/docs/latest/use/configure/configuration-files#specifying-files-and-ignores
  {
    files: ['src/generators/legacy-html/assets/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
  // @see https://eslint.org/docs/latest/rules to learn more about these rules
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['src/generators/api-links/test/fixtures/**'],
  },
];
