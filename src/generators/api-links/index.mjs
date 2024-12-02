'use strict';

import { basename, dirname, join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { getGitRepository, getGitTag } from '../../utils/git.mjs';
import { extractExports } from './utils/extractExports.mjs';
import { findDefinitions } from './utils/findDefinitions.mjs';

/**
 * This generator is responsible for mapping publicly accessible functions in
 * Node.js to their source locations in the Node.js repository.
 *
 * This is a top-level generator. It takes in the raw AST tree of the JavaScript
 * source files. It outputs a `apilinks.json` file into the specified output
 * directory.
 *
 * @typedef {Array<JsProgram>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, Record<string, string>>}
 */
export default {
  name: 'api-links',

  version: '1.0.0',

  description:
    'Creates a mapping of publicly accessible functions to their source locations in the Node.js repository.',

  dependsOn: 'ast-js',

  /**
   * Generates the `apilinks.json` file.
   *
   * @param {Input} input
   * @param {Partial<GeneratorOptions>} options
   */
  async generate(input, { output }) {
    /**
     * @type {Record<string, string>}
     */
    const definitions = {};

    /**
     * @type {string}
     */
    let baseGithubLink;

    input.forEach(program => {
      /**
       * Mapping of definitions to their line number
       * @type {Record<string, number>}
       * @example { 'someclass.foo', 10 }
       */
      const nameToLineNumberMap = {};

      const programBasename = basename(program.path, '.js');

      const exports = extractExports(
        program,
        programBasename,
        nameToLineNumberMap
      );

      findDefinitions(program, programBasename, nameToLineNumberMap, exports);

      if (!baseGithubLink) {
        const directory = dirname(program.path);

        const repository = getGitRepository(directory);

        const tag = getGitTag(directory);

        baseGithubLink = `https://github.com/${repository}/blob/${tag}`;
      }

      const githubLink =
        `${baseGithubLink}/lib/${programBasename}.js`.replaceAll('\\', '/');

      Object.keys(nameToLineNumberMap).forEach(key => {
        const lineNumber = nameToLineNumberMap[key];

        definitions[key] = `${githubLink}#L${lineNumber}`;
      });
    });

    if (output) {
      await writeFile(
        join(output, 'apilinks.json'),
        JSON.stringify(definitions)
      );
    }

    return definitions;
  },
};
