import { generate } from '@babel/generator';
import * as t from '@babel/types';

import { JSX_IMPORTS } from '../constants.mjs';

/**
 * Creates an import declaration AST node
 * @param {string|null} defaultImport - The default import identifier name, or null for side-effect imports
 * @param {string} source - The module path to import from
 */
const importDeclaration = (defaultImport, source) =>
  t.importDeclaration(
    defaultImport
      ? [t.importDefaultSpecifier(t.identifier(defaultImport))]
      : [],
    t.stringLiteral(source)
  );

/**
 * @param ast - the abstract syntax tree from which to generate output code.
 */
const gen = ast => generate(ast).code;

/**
 * Creates an AST builder with hardcoded configuration for React SSR/hydration
 */
export default () => {
  const imports = Object.values(JSX_IMPORTS).map(({ name, source }) =>
    importDeclaration(name, source)
  );
  /**
   * Generates code that hydrates a server-rendered React component on the client
   * @param {import('@babel/types').Expression} component - The React component AST node to hydrate
   */
  const buildClientProgram = component =>
    gen(
      t.program([
        ...imports,
        importDeclaration(null, '@node-core/ui-components/styles/index.css'),
        importDeclaration('ReactDOM', 'react-dom/client'),

        // ReactDOM.hydrateRoot(document.getElementById("root"), Component);
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier('ReactDOM'),
              t.identifier('hydrateRoot')
            ),
            [
              t.callExpression(
                t.memberExpression(
                  t.identifier('document'),
                  t.identifier('getElementById')
                ),
                [t.stringLiteral('root')]
              ),
              component,
            ]
          )
        ),
      ])
    );

  /**
   * Creates a complete server-side program AST for React server-side rendering
   * Generates code that renders a React component to string on the server
   * @param {import('@babel/types').Expression} component - The React component AST node to render
   */
  const buildServerProgram = component =>
    gen(
      t.program([
        ...imports,
        importDeclaration('ReactDOM', 'react-dom/server'),
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.identifier('code'),
            t.callExpression(
              t.memberExpression(
                t.identifier('ReactDOM'),
                t.identifier('renderToString')
              ),
              [component]
            )
          )
        ),
      ])
    );

  return {
    buildClientProgram,
    buildServerProgram,
  };
};
