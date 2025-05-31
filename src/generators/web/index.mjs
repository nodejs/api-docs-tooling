import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { estreeToBabel } from 'estree-to-babel';
import { minify } from 'html-minifier-terser';

import { ESBUILD_RESOLVE_DIR, TEMPLATE_PLACEHOLDERS } from './constants.mjs';
import { TERSER_MINIFY_OPTIONS } from '../../constants.mjs';
import createASTBuilder from './utils/astBuilder.mjs';
import bundleCode from './utils/bundle.mjs';

/**
 * Executes server-side code in a safe, isolated context
 * @param {string} serverCode - The server code to execute
 * @param {ReturnType<createRequire>} require - Node.js require function for dependencies
 * @returns {Promise<string>} The rendered HTML output
 */
async function executeServerCode(serverCode, require) {
  const { js: bundledServer } = await bundleCode(serverCode, {
    platform: 'node',
  });

  const executedFunction = new Function(
    'require',
    `
    let code;
    ${bundledServer}
    return code;
  `
  );

  return executedFunction(require);
}

/**
 * Processes a single entry and writes the HTML file immediately
 * @param {import('../jsx-ast/utils/buildContent.mjs').JSXContent} entry - JSX AST entry
 * @param {string} template - HTML template
 * @param {ReturnType<createASTBuilder>} astBuilders - AST builder functions
 * @param {ReturnType<createRequire>} require - Node.js require function
 * @param {string} output - Output directory path
 * @returns {Promise<{html: string, css?: string}>}
 */
async function processEntry(
  entry,
  template,
  { buildServerProgram, buildClientProgram },
  require,
  output
) {
  // Convert JSX AST to Babel AST
  const { program } = estreeToBabel(entry);

  // Generate and execute server-side code for SSR
  const serverCode = buildServerProgram(program);
  const serverRenderedHTML = await executeServerCode(serverCode, require);

  // Generate and bundle client-side code
  const clientCode = buildClientProgram(program);
  const clientBundle = await bundleCode(clientCode);

  // Render the final HTML using the template
  const finalHTML = await minify(
    template
      .replace(TEMPLATE_PLACEHOLDERS.TITLE, entry.data.heading.data.name)
      .replace(TEMPLATE_PLACEHOLDERS.DEHYDRATED, serverRenderedHTML)
      .replace(TEMPLATE_PLACEHOLDERS.JAVASCRIPT, clientBundle.js),
    TERSER_MINIFY_OPTIONS
  );

  // Write HTML file immediately if output directory is specified
  if (output) {
    await writeFile(join(output, `${entry.data.api}.html`), finalHTML, 'utf-8');
  }

  return {
    html: finalHTML,
    css: clientBundle.css,
  };
}

/**
 * This generator generates a JavaScript / HTML / CSS bundle from the input JSX AST
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'web',
  version: '1.0.0',
  description: 'Generates HTML/CSS/JS bundles from JSX AST entries',
  dependsOn: 'jsx-ast',

  /**
   * Generates a JavaScript / HTML / CSS bundle
   *
   * @param {import('../jsx-ast/utils/buildContent.mjs').JSXContent[]} entries
   * @param {Partial<GeneratorOptions>} options
   */
  async generate(entries, { output }) {
    // Load template and set up dependencies
    const template = await readFile(
      new URL('template.html', import.meta.url),
      'utf-8'
    );
    const astBuilders = createASTBuilder();
    const require = createRequire(ESBUILD_RESOLVE_DIR);

    // Process all entries in parallel
    const results = await Promise.all(
      entries.map(entry => processEntry(entry, template, astBuilders, require))
    );

    if (output) {
      await writeFile(
        join(output, 'styles.css'),
        results.find(result => result.css).css
      );
    }

    return results.map(result => result.html);
  },
};
