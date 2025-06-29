import { generate } from '@babel/generator';
import * as t from '@babel/types';

import { JSX_IMPORTS } from '../constants.mjs';

/**
 * Creates an import declaration AST node
 * @param {string|null} importName - The import identifier name, or null for side-effect imports
 * @param {string} source - The module path to import from
 * @param {boolean} [useDefault=true] - Whether to use a default import or a named import
 */
export const createImportDeclaration = (
  importName,
  source,
  useDefault = true
) => {
  const specifiers = importName
    ? [
        useDefault
          ? t.importDefaultSpecifier(t.identifier(importName))
          : t.importSpecifier(
              t.identifier(importName),
              t.identifier(importName)
            ),
      ]
    : [];

  return t.importDeclaration(specifiers, t.stringLiteral(source));
};

/**
 * Generates code from an AST
 * @param {import('@babel/types').Node} ast - The AST node to generate code from
 * @returns {string} The generated code
 */
const generateCode = ast => generate(ast).code;

/**
 * Creates an AST builder with configuration for React SSR/hydration using Preact
 */
export default () => {
  // Create base imports from JSX_IMPORTS configuration
  // TODO(@avivkeller): A lot of these imports aren't interactive (i.e. the MetaBar),
  // so it would be nice to not pass them to the client at all.
  const baseImports = Object.values(JSX_IMPORTS).map(({ name, source }) =>
    createImportDeclaration(name, source)
  );

  /**
   * Generates code that hydrates a server-rendered React component on the client
   * @param {import('@babel/types').Expression} component - The React component AST node to hydrate
   * @returns {string} The generated client-side hydration code
   */
  const buildClientProgram = component => {
    const program = t.program([
      ...baseImports,
      createImportDeclaration(
        null,
        // Relative to ESBUILD_RESOLVE_DIR
        './index.css'
      ),
      createImportDeclaration('hydrate', 'preact', false),

      // hydrate(component, document.getElementById("root"));
      t.expressionStatement(
        t.callExpression(t.identifier('hydrate'), [
          component,
          t.callExpression(
            t.memberExpression(
              t.identifier('document'),
              t.identifier('getElementById')
            ),
            [t.stringLiteral('root')]
          ),
        ])
      ),
    ]);

    return generateCode(program);
  };

  /**
   * Generates code that renders a React component to string on the server
   * @param {import('@babel/types').Expression} component - The React component AST node to render
   * @returns {string} The generated server-side rendering code
   */
  const buildServerProgram = component => {
    const program = t.program([
      ...baseImports,
      createImportDeclaration(
        'renderToStringAsync',
        'preact-render-to-string',
        false
      ),

      // code = renderToStringAsync(component);
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.identifier('code'),
          t.callExpression(t.identifier('renderToStringAsync'), [component])
        )
      ),
    ]);

    return generateCode(program);
  };

  return {
    buildClientProgram,
    buildServerProgram,
  };
};
