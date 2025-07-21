'use strict';

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { visit } from 'unist-util-visit';

import { generateFileList } from './utils/generateFileList.mjs';
import {
  generateSectionFolderName,
  isBuildableSection,
  normalizeSectionName,
} from './utils/section.mjs';
import { EXTRACT_CODE_FILENAME_COMMENT } from '../../utils/queries/regex.mjs';

/**
 * This generator generates a file list from code blocks extracted from
 * `doc/api/addons.md` to facilitate C++ compilation and JavaScript runtime
 * validations.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, string>}
 */
export default {
  name: 'addon-verify',

  version: '1.0.0',

  description:
    'Generates a file list from code blocks extracted from `doc/api/addons.md` to facilitate C++ compilation and JavaScript runtime validations',

  dependsOn: 'metadata',

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
        .filter(([, codeBlocks]) => isBuildableSection(codeBlocks))
        .flatMap(async ([sectionName, codeBlocks], index) => {
          const files = generateFileList(codeBlocks);

          if (output) {
            const normalizedSectionName = normalizeSectionName(sectionName);

            const folderName = generateSectionFolderName(
              normalizedSectionName,
              index
            );

            await mkdir(join(output, folderName), { recursive: true });

            for (const file of files) {
              await writeFile(
                join(output, folderName, file.name),
                file.content
              );
            }
          }

          return files;
        })
    );

    return files;
  },
};
