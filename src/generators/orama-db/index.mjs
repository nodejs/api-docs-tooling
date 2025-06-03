'use strict';

import { create, insert } from '@orama/orama';
import { persistToFile } from '@orama/plugin-data-persistence/server';

import { enforceArray } from '../../utils/array.mjs';
import { groupNodesByModule } from '../../utils/generators.mjs';
import { createSectionBuilder } from '../legacy-json/utils/buildSection.mjs';

/**
 * Schema definition for the Orama database
 */
const ORAMA_SCHEMA = {
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
};

/**
 * Transforms a section into the format expected by Orama
 * @param {import('../legacy-json/types.d.ts').ModuleSection} node - The section to transform
 */
function transformSectionForOrama(node) {
  return {
    name: node.name,
    type: node.type,
    desc: node.desc,
    // Account for duplicate stability nodes
    stability: enforceArray(node.stability)[0],
    stabilityText: enforceArray(node.stabilityText)[0],
    meta: {
      changes:
        node.meta?.changes?.map(
          c => `${enforceArray(c.version).join(', ')}: ${c.description}`
        ) ?? [],
      added: node.meta?.added ?? [],
      napiVersion: node.meta?.napiVersion ?? [],
      deprecated: node.meta?.deprecated ?? [],
      removed: node.meta?.removed ?? [],
    },
  };
}

/**
 * This generator is responsible for generating the Orama database for the
 * API docs. It is based on the legacy-json generator.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, import('./types.d.ts').OramaDb>}
 */
export default {
  name: 'orama-db',
  version: '1.0.0',
  description: 'Generates the Orama database for the API docs.',

  dependsOn: 'metadata',

  /**
   * Generates the Orama database.
   *
   * @param {Input} input
   * @param {Partial<GeneratorOptions>} options
   */
  async generate(input, { output, version }) {
    if (!input?.length) {
      throw new Error('Input data is required and must not be empty');
    }

    if (!output || !version) {
      throw new Error('Output path and version are required');
    }

    const db = create({ schema: ORAMA_SCHEMA });
    const buildSection = createSectionBuilder();
    const groupedModules = groupNodesByModule(input);
    const headNodes = input.filter(node => node.heading?.depth === 1);

    // Process each head node and insert into database
    headNodes.forEach(headNode => {
      const nodes = groupedModules.get(headNode.api);

      const section = buildSection(headNode, nodes);
      const node = (section.modules || section.globals || section.miscs)[0];
      if (!node) return;

      const oramaData = transformSectionForOrama(node);
      insert(db, oramaData);
    });

    // Generate output filename and persist database
    const sanitizedVersion = version.raw.replaceAll('.', '-');
    const outputFilename = `${output}/${sanitizedVersion}-orama-db.json`;

    await persistToFile(db, 'json', outputFilename);
  },
};
