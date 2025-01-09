'use strict';

import { visit } from 'unist-util-visit';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { updateFilesForBuild } from './utils/updateFilesForBuild.mjs';
import { EXTRACT_CODE_FILENAME_COMMENT } from './constants.mjs';

/**
 * Normalizes a section name.
 *
 * @param {string} sectionName Section name
 * @returns {string}
 */
export function normalizeSectionName(sectionName) {
  return sectionName.toLowerCase().replace(/\s/g, '_').replace(/\W/g, '');
}

/**
 * This generator generates a file list from code blocks extracted from
 * `doc/api/addons.md` to facilitate C++ compilation and JavaScript runtime
 * validations.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, string>}
 */
export default {
  name: 'addon-verify',

  version: '1.0.0',

  description: '',

  dependsOn: 'ast',

  /**
   * Generates a file list from code blocks.
   *
   * @param {Input} input
   * @param {Partial<GeneratorOptions>} options
   */
  async generate(input, { output }) {
    const sectionsCodeBlocks = input.reduce((addons, node) => {
      const sectionName = node.heading.data.name;

      const content = node.content;

      visit(content, childNode => {
        if (childNode.type === 'code') {
          const filename = childNode.value.match(EXTRACT_CODE_FILENAME_COMMENT);

          if (filename === null) {
            return;
          }

          if (!addons[sectionName]) {
            addons[sectionName] = [];
          }

          addons[sectionName].push({
            name: filename[1],
            content: childNode.value,
          });
        }
      });

      return addons;
    }, {});

    const files = await Promise.all(
      Object.entries(sectionsCodeBlocks)
        .filter(([, files]) => {
          // Must have a .cc and a .js to be a valid test.
          return (
            files.some(file => file.name.endsWith('.cc')) &&
            files.some(file => file.name.endsWith('.js'))
          );
        })
        .flatMap(async ([sectionName, files], index) => {
          const newFiles = updateFilesForBuild(files);

          if (output) {
            const normalizedSectionName = normalizeSectionName(sectionName);

            const identifier = String(index + 1).padStart(2, '0');

            const folder = `${identifier}_${normalizedSectionName}`;

            await mkdir(join(output, folder), { recursive: true });

            newFiles.forEach(async ({ name, content }) => {
              await writeFile(join(output, folder, name), content);
            });
          }

          return newFiles;
        })
    );

    return files;
  },
};
