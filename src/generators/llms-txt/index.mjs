'use strict';

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateDocEntry } from './utils/generateDocEntry.mjs';
import { LATEST_DOC_API_BASE_URL } from './constants.mjs';

/**
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'llms-txt',
  version: '1.0.0',
  description: 'Generates a llms.txt file of the API docs',
  dependsOn: 'ast',

  /**
   * @param {Input} input The API documentation metadata
   * @param {Partial<GeneratorOptions>} options Generator options
   * @returns {Promise<string>} The generated documentation text
   */
  async generate(input, options) {
    const template = await readFile(
      join(import.meta.dirname, 'template.txt'),
      'utf-8'
    );

    const apiDocEntries = input.map(generateDocEntry).filter(Boolean);

    const introductionEntries = [
      `- [About this documentation](${LATEST_DOC_API_BASE_URL}/api/documentation.md)`,
      `- [Usage and examples](${LATEST_DOC_API_BASE_URL}/api/synopsis.md)`,
    ];

    const filledTemplate = template
      .replace('__INTRODUCTION__', introductionEntries.join('\n'))
      .replace('__API_DOCS__', apiDocEntries.join('\n'));

    if (options.output) {
      await writeFile(join(options.output, 'llms.txt'), filledTemplate);
    }

    return filledTemplate;
  },
};
