import { JSX_IMPORTS } from '../constants.mjs';

/**
 * Creates an import statement as a string
 * @param {string|null} importName - The import identifier name, or null for side-effect imports
 * @param {string} source - The module path to import from
 * @param {boolean} [useDefault=true] - Whether to use a default import or a named import
 * @returns {string} The import statement
 */
export const createImportDeclaration = (
  importName,
  source,
  useDefault = true
) => {
  if (!importName) {
    return `import "${source}";`;
  }
  if (useDefault) {
    return `import ${importName} from "${source}";`;
  }
  return `import { ${importName} } from "${source}";`;
};

/**
 * Creates a code builder with configuration for React SSR/hydration using Preact
 */
export default () => {
  // Create base imports from JSX_IMPORTS configuration
  // TODO(@avivkeller): A lot of these imports aren't interactive (i.e. the MetaBar),
  // so it would be nice to not pass them to the client at all.
  const baseImports = Object.values(JSX_IMPORTS).map(
    ({ name, source, default: useDefault = true }) =>
      createImportDeclaration(name, source, useDefault)
  );

  /**
   * Generates code that hydrates a server-rendered React component on the client
   * @param {string} componentCode - The React component code as a string to hydrate
   * @returns {string} The generated client-side hydration code
   */
  const buildClientProgram = componentCode => {
    return [
      ...baseImports,
      createImportDeclaration(
        null,
        new URL('../ui/index.css', import.meta.url).pathname
      ),
      createImportDeclaration('hydrate', 'preact', false),
      '',
      `hydrate(${componentCode}, document.getElementById("root"));`,
    ].join('\n');
  };

  /**
   * Generates code that renders a React component to string on the server
   * @param {string} componentCode - The React component code as a string to render
   * @returns {string} The generated server-side rendering code
   */
  const buildServerProgram = componentCode => {
    return [
      ...baseImports,
      createImportDeclaration(
        'renderToStringAsync',
        'preact-render-to-string',
        false
      ),
      '',
      `const code = renderToStringAsync(${componentCode});`,
    ].join('\n');
  };

  return {
    buildClientProgram,
    buildServerProgram,
  };
};
