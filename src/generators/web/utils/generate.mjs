import { JSX_IMPORTS } from '../constants.mjs';

/**
 * Creates an ES Module `import` statement as a string, based on parameters.
 *
 * @param {string|null} importName - The identifier to import
 * @param {string} source - The module path
 * @param {boolean} [useDefault=true] - Determines if the import is a default or named import.
 */
export const createImportDeclaration = (
  importName,
  source,
  useDefault = true
) => {
  // Side-effect-only import (CSS)
  if (!importName) {
    return `import "${source}";`;
  }

  // Import default export
  if (useDefault) {
    return `import ${importName} from "${source}";`;
  }

  // Import named export
  return `import { ${importName} } from "${source}";`;
};

/**
 * Factory function that returns two program generators:
 * - One for hydrating client-side React/Preact apps
 * - One for server-side rendering (SSR) to HTML
 */
export default () => {
  // Construct a list of `import` statements from JSX_IMPORTS
  //
  // TODO(@avivkeller): A known optimization opportunity exists:
  // Some of these imports are only needed on the server (or only client).
  // It would be more efficient to generate them conditionally.
  const baseImports = Object.values(JSX_IMPORTS).map(
    ({ name, source, isDefaultExport = true }) =>
      createImportDeclaration(name, source, isDefaultExport)
  );

  /**
   * Builds a client-side hydration program.
   * @param {string} componentCode - Code expression representing a JSX component
   */
  const buildClientProgram = componentCode => {
    return [
      // JSX component imports
      ...baseImports,

      // Import client-side CSS styles.
      // This ensures that styles used in the rendered app are loaded on the client.
      // The use of `new URL(...).pathname` resolves the absolute path for `entrypoint.jsx`.
      createImportDeclaration(
        null,
        new URL('../ui/index.css', import.meta.url).pathname
      ),

      // Import `hydrate()` from Preact — needed to attach to server-rendered HTML.
      // This is a named import (not default), hence `false` as the third argument.
      createImportDeclaration('hydrate', 'preact', false),

      '',

      // Hydration call: binds the component to an element with ID "root"
      // This assumes SSR has placed matching HTML there, which, it has.
      `hydrate(${componentCode}, document.getElementById("root"));`,
    ].join('\n');
  };

  /**
   * Builds a server-side rendering (SSR) program.
   *
   * @param {string} componentCode - Code expression representing a JSX component
   */
  const buildServerProgram = componentCode => {
    return [
      // JSX component imports
      ...baseImports,

      // Import `renderToStringAsync()` from Preact's SSR module
      createImportDeclaration(
        'renderToStringAsync',
        'preact-render-to-string',
        false
      ),

      // Render the component to an HTML string
      // The output can be embedded directly into the server's HTML template
      `const code = renderToStringAsync(${componentCode});`,
    ].join('\n');
  };

  return {
    buildClientProgram,
    buildServerProgram,
  };
};
