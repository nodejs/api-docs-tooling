'use strict';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { groupNodesByModule } from '../../utils/generators.mjs';
import buildContent from './utils/buildContent.mjs';

/**
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, import('./types.d.ts').Section>}
 */
export default {
  name: 'legacy-json',

  version: '1.0.0',

  description: 'Generates the legacy version of the JSON API docs.',

  dependsOn: 'ast',

  async generate(input, { output }) {
    // This array holds all the generated values for each module
    const generatedValues = [];

    const groupedModules = groupNodesByModule(input);

    // Gets the first nodes of each module, which is considered the "head" of the module
    const headNodes = input.filter(node => node.heading.depth === 1);

    /**
     * @param {ApiDocMetadataEntry} head
     * @returns {import('./types.d.ts').ModuleSection}
     */
    const processModuleNodes = head => {
      const nodes = groupedModules.get(head.api);

      const parsedContent = buildContent(head, nodes);
      generatedValues.push(parsedContent);

      return parsedContent;
    };

    for (const node of headNodes) {
      const result = processModuleNodes(node);
      // console.log(result)

      await writeFile(
        join(output, `${node.api}.json`),
        JSON.stringify(result),
        'utf8'
      );
    }

    return generatedValues;
  },
};
