import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { estreeToBabel } from 'estree-to-babel';
import Mustache from 'mustache';

import { ESBUILD_RESOLVE_DIR } from './constants.mjs';
import createASTBuilder from './utils/astBuilder.mjs';
import bundleCode from './utils/bundle.mjs';

/**
 * Executes server-side code in a safe, isolated context
 * @param {string} serverCode - The server code to execute
 * @param {Function} require - Node.js require function for dependencies
 * @returns {Promise<string>} The rendered HTML output
 */
async function executeServerCode(serverCode, require) {
  // Bundle the server code for execution
  const { js: bundledServer } = await bundleCode(serverCode, {
    platform: 'node',
  });

  // Create a safe execution context that returns the rendered content
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
    // Load the HTML template
    const template = await readFile(
      new URL('template.html', import.meta.url),
      'utf-8'
    );

    // Set up AST builders for server and client code
    const { buildServerProgram, buildClientProgram } = createASTBuilder();
    const require = createRequire(ESBUILD_RESOLVE_DIR);

    let css; // Will store CSS from the first bundle

    // Process each entry in parallel
    const bundles = await Promise.all(
      entries.map(async entry => {
        // Convert JSX AST to Babel AST
        const { program } = estreeToBabel(entry);

        // Generate and execute server-side code for SSR
        const serverCode = buildServerProgram(program);
        const serverRenderedHTML = await executeServerCode(serverCode, require);

        // Generate and bundle client-side code
        const clientCode = buildClientProgram(program);
        const clientBundle = await bundleCode(clientCode);

        // Extract CSS only from the first bundle to avoid duplicates
        css ??= clientBundle.css;

        // Render the final HTML using the template
        const finalHTML = Mustache.render(template, {
          title: entry.data.heading.data.name,
          javascript: clientBundle.js,
          dehydrated: serverRenderedHTML,
        });

        // Write individual HTML file if output directory is specified
        if (output) {
          const filename = `${entry.data.api}.html`;
          await writeFile(join(output, filename), finalHTML);
        }

        return finalHTML;
      })
    );

    // Write shared CSS file if we have CSS and an output directory
    if (output && css) {
      await writeFile(join(output, 'styles.css'), css);
    }

    return bundles;
  },
};
