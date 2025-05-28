import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import HTMLMinifier from '@minify-html/node';
import { jsx, toJs } from 'estree-util-to-js';
import Mustache from 'mustache';

import bundleCode from './build/bundle.mjs';
import createASTBuilder from './build/generate.mjs';
import { RESOLVE_DIR } from './constants.mjs';

/**
 * Executes server-side code in a safe, isolated context
 * @param {string} serverCode - The server code to execute
 * @param {ReturnType<createRequire>} require - Node.js require function for dependencies
 * @returns {Promise<string>} The rendered HTML output
 */
export async function executeServerCode(serverCode, require) {
  const { js: bundledServer } = await bundleCode(serverCode, { server: true });

  const executedFunction = new Function(
    'require',
    `let code;${bundledServer}return code;`
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
export async function processEntry(
  entry,
  template,
  { buildServerProgram, buildClientProgram },
  require,
  output
) {
  const { value: code } = toJs(entry, { handlers: jsx });

  // Generate and execute server-side code for SSR
  const serverCode = buildServerProgram(code);
  const dehydrated = await executeServerCode(serverCode, require);

  // Generate and bundle client-side code
  const clientCode = buildClientProgram(code);
  const clientBundle = await bundleCode(clientCode);

  // Render the final HTML using the template
  const finalHTML = HTMLMinifier.minify(
    Buffer.from(
      // TODO(@avivkeller): Don't depend on mustache
      Mustache.render(template, {
        title: entry.data.heading.data.name,
        dehydrated,
        javascript: clientBundle.js,
      })
    ),
    {}
  );

  // Write HTML file if output directory is specified
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
    const require = createRequire(RESOLVE_DIR);

    // Process all entries
    const results = [];
    for (const entry of entries) {
      results.push(
        await processEntry(entry, template, astBuilders, require, output)
      );
    }

    if (output) {
      await writeFile(
        join(output, 'styles.css'),
        results.find(result => result.css).css
      );
    }

    return results;
  },
};
