import pluginJs from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  pluginJs.configs.recommended,
  importX.flatConfigs.recommended,
  {
    ignores: ['out/', 'src/generators/api-links/__tests__/fixtures/'],
  },
  {
    files: ['**/*.mjs'],
    rules: {
      'object-shorthand': 'error',
      'import-x/namespace': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['sibling', 'parent'],
            'index',
            'unknown',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ['src/**/*.mjs', 'bin/**/*.mjs'],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.nodeBuiltin },
    },
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
  {
    files: ['src/generators/legacy-html/assets/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
];
