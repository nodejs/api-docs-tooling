import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { buildApiDocLink } from './utils/buildApiDocLink.mjs';
import { ENTRY_IGNORE_LIST } from './constants.mjs';
import { getIntroLinks } from './utils/getIntroLinks.mjs';

/**
 * This generator generates a llms.txt file to provide information to LLMs at
 * inference time
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'llms-txt',

  version: '1.0.0',

  description:
    'Generates a llms.txt file to provide information to LLMs at inference time',

  dependsOn: 'ast',

  /**
   * Generates a llms.txt file
   *
   * @param {Input} entries
   * @param {Partial<GeneratorOptions>} options
   * @returns {Promise<void>}
   */
  async generate(entries, { output }) {
    const template = await readFile(
      join(import.meta.dirname, 'template.txt'),
      'utf-8'
    );

    const introLinks = getIntroLinks().join('\n');

    const apiDocsLinks = entries
      .filter(entry => {
        // Filter non top-level headings and ignored entries
        return (
          entry.heading.depth === 1 || ENTRY_IGNORE_LIST.includes(entry.path)
        );
      })
      .map(entry => {
        const link = buildApiDocLink(entry);
        return `- ${link}`;
      })
      .join('\n');

    const filledTemplate = template
      .replace('__INTRODUCTION__', introLinks)
      .replace('__API_DOCS__', apiDocsLinks);

    if (output) {
      await writeFile(join(output, 'llms.txt'), filledTemplate);
    }

    return filledTemplate;
  },
};
