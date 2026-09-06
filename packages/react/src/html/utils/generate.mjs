import { resolve } from 'node:path';

import getConfig from '@doc-kit/core/utils/configuration/index.mjs';
import { omitKeys } from '@doc-kit/core/utils/misc.mjs';

import {
  JSX_IMPORTS,
  JSX_PRAGMA,
  JSX_PRAGMA_FRAG,
  ROOT,
} from '../constants.mjs';

/**
 * Normalizes a `components` config entry into the `JSXImportConfig` shape.
 * Accepts either the full descriptor or the `Tag: 'source'` string shorthand.
 *
 * @param {[string, import('../constants.mjs').JSXImportConfig | string]} entry
 * @returns {import('../constants.mjs').JSXImportConfig}
 */
const normalizeComponent = ([tag, value]) =>
  typeof value === 'string'
    ? { name: tag, source: value }
    : { name: tag, isDefaultExport: true, ...value };

/**
 * Quotes a module source for an import/export statement, escaping backslashes
 * so Windows paths are not treated as escape sequences.
 *
 * @param {string} source
 */
const quote = source => `"${source.replaceAll('\\', '\\\\')}"`;

/**
 * Creates an ES Module `import` statement as a string, based on parameters.
 *
 * @param {string|null} importName - The identifier to import.
 * @param {string} source - The module path.
 * @param {boolean} [useDefault=true] - Whether to use default import (true) or named import (false).
 * @returns {string} The generated import statement.
 */
export const createImportDeclaration = (
  importName,
  source,
  useDefault = true
) => {
  // Side-effect-only import (e.g., CSS files)
  if (!importName) {
    return `import ${quote(source)};`;
  }

  // Default import: import Name from "source"
  if (useDefault) {
    return `import ${importName} from ${quote(source)};`;
  }

  // Named import: import { Name } from "source"
  return `import { ${importName} } from ${quote(source)};`;
};

/**
 * Creates an ES Module re-export statement as a string.
 *
 * @param {import('../constants.mjs').JSXImportConfig} component
 * @returns {string}
 */
const createExportDeclaration = ({ name, source, isDefaultExport = true }) =>
  isDefaultExport
    ? `export { default as ${name} } from ${quote(source)};`
    : `export { ${name} } from ${quote(source)};`;

/**
 * The names a page's program imports from the component library besides the
 * components it renders: the JSX runtime, the layout, and the renderer.
 */
const RUNTIME_IMPORTS = [
  `h as ${JSX_PRAGMA}`,
  `Fragment as ${JSX_PRAGMA_FRAG}`,
  JSX_IMPORTS.Layout.name,
  'renderToStringAsync',
];

/**
 * Factory function that creates the page programs.
 */
export default () => {
  // User-configured components (for JSX-in-MDX), merged with the built-ins.
  const { components, stylesheets } = getConfig('html');

  const componentImports = [
    ...Object.values(JSX_IMPORTS),
    ...Object.entries(components).map(normalizeComponent),
  ];

  /**
   * The server-side component library: one module re-exporting every
   * component a page may render, Preact's JSX runtime, and the renderer. The
   * bundler builds it once; every page program imports from the result, so the
   * components are compiled once rather than once per page.
   *
   * @returns {string} The library's source.
   */
  const buildLibraryProgram = () =>
    [
      ...componentImports.map(createExportDeclaration),
      'export { h, Fragment } from "preact";',
      'export { renderToStringAsync } from "preact-render-to-string";',
    ].join('\n');

  /**
   * Builds a page's server program: a module exporting the page's `content`
   * (a function returning the JSX fragment, so each render gets fresh
   * elements), its `headings`, and a default export rendering the page.
   *
   * A composed page (`all.html`) has no content of its own: it imports the
   * `content` of the pages it is made of, so their JSX is never rebuilt.
   *
   * @param {import('../types').Page} page
   * @param {string} libraryURL - Where the built component library was written.
   * @returns {string} The program, as JSX.
   */
  const buildPageProgram = (page, libraryURL) => {
    const { data, headings, readingTime } = page;

    const { imports, content } =
      'parts' in page
        ? {
            imports: page.parts.map(
              (api, index) =>
                `import { content as content${index} } from ${quote(`./${moduleFileName(api)}`)};`
            ),
            content: `<>${page.parts.map((_, index) => `{content${index}()}`).join('')}</>`,
          }
        : { imports: [], content: page.content };

    // Import only the components the page actually renders
    const used = componentImports
      .filter(({ name }) => content.includes(`<${name}`))
      .map(({ name }) => name)
      .filter(name => name !== JSX_IMPORTS.Layout.name);

    // The metadata is the head without the node children
    const metadata = omitKeys(data, [
      'content',
      'heading',
      'stability',
      'changes',
    ]);

    return [
      `import { ${[...RUNTIME_IMPORTS, ...used].join(', ')} } from ${quote(libraryURL)};`,
      ...imports,
      `export const headings = ${JSON.stringify(headings)};`,
      `export const content = () => ${content};`,
      `export default () => renderToStringAsync(<${JSX_IMPORTS.Layout.name} metadata={${JSON.stringify(metadata)}} headings={headings} readingTime={${JSON.stringify(readingTime?.text)}}>{content()}</${JSX_IMPORTS.Layout.name}>);`,
    ].join('\n');
  };

  // The client entry, shared verbatim by every page
  const clientProgram = [
    createImportDeclaration(null, resolve(ROOT, './ui/index.css')),

    // Project stylesheets are bundled after the built-in one, so their rules
    // and custom properties (e.g. `--color-brand-*`) win.
    ...stylesheets.map(stylesheet =>
      createImportDeclaration(null, resolve(stylesheet))
    ),

    createImportDeclaration(
      'registerIslands',
      resolve(ROOT, './ui/islands/runtime.mjs'),
      false
    ),

    `registerIslands({${componentImports
      .map(
        ({ name, source }) =>
          `${JSON.stringify(name)}: () => import(${JSON.stringify(source)})`
      )
      .join(', ')}});`,
  ].join('\n');

  return { buildLibraryProgram, buildPageProgram, clientProgram };
};

/**
 * The file a page's compiled program is written to, next to the others, so a
 * composed page can import its parts by relative path.
 *
 * @param {string} api
 */
export const moduleFileName = api => `${api}.mjs`;
