'use strict';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { create } from '@orama/orama';
import { groupNodesByModule } from '../../utils/generators.mjs';
import { createSectionBuilder } from '../legacy-json/utils/buildSection.mjs';

/**
 * This generator is responsible for generating the Orama database for the
 * API docs. It is based on the legacy-json generator.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, import('./types.d.ts').OramaDb>}
 */
export default {
  name: 'orama-db',

  version: '1.0.0',

  description: 'Generates the Orama database for the API docs.',

  dependsOn: 'ast',

  /**
   * Generates the Orama database.
   *
   * @param {Input} input
   * @param {Partial<GeneratorOptions>} options
   */
  async generate(input, { output }) {
    const buildSection = createSectionBuilder();

    // Create the Orama instance with the schema
    const db = create({
      schema: {
        name: 'string',
        type: 'string',
        desc: 'string',
        stability: 'number',
        stabilityText: 'string',
        meta: {
          changes: 'string[]',
          added: 'string[]',
          napiVersion: 'string[]',
          deprecated: 'string[]',
          removed: 'string[]',
        },
      },
    });

    const groupedModules = groupNodesByModule(input);

    // Gets the first nodes of each module, which is considered the "head"
    const headNodes = input.filter(node => node.heading.depth === 1);

    /**
     * @param {ApiDocMetadataEntry} head
     * @returns {import('./types.d.ts').OramaDbEntry}
     */
    const processModuleNodes = head => {
      const nodes = groupedModules.get(head.api);

      const section = buildSection(head, nodes);

      // Insert data into the Orama instance
      db.insert({
        name: section.name,
        type: section.type,
        desc: section.desc,
        stability: section.stability,
        stabilityText: section.stabilityText,
        meta: {
          changes: section.meta.changes,
          added: section.meta.added,
          napiVersion: section.meta.napiVersion,
          deprecated: section.meta.deprecated,
          removed: section.meta.removed,
        },
      });

      return section;
    };

    await Promise.all(
      headNodes.map(async node => {
        // Get the json for the node's section
        const section = processModuleNodes(node);

        // Write it to the output file
        if (output) {
          await writeFile(
            join(output, `${node.api}.json`),
            JSON.stringify(section)
          );
        }
      })
    );

    // Generate the JSON representation of the Orama db
    const oramaDbJson = JSON.stringify(db);

    if (output) {
      await writeFile(join(output, 'orama-db.json'), oramaDbJson);
    }

    return db;
  },
};
