// @ts-check
'use strict';

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'jsonc-parser';
import { groupNodesByModule } from '../../utils/generators.mjs';
import { createSectionBuilder } from './utils/createSection.mjs';

// TODO add test w/ https://www.npmjs.com/package/jsonschema

/**
 * This generator is responsible for generating the JSON representation of the
 * docs.
 *
 * This is a top-level generator, intaking the raw AST tree of the api docs.
 * It generates JSON files to the specified output directory given by the
 * config.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, Array<import('./generated.d.ts').NodeJsAPIDocumentationSchema>>}
 */
export default {
  name: 'json',

  version: '1.0.0',

  description: 'TODO',

  dependsOn: 'ast',

  /**
   * Generates a JSON file.
   *
   * @param {Input} input
   * @param {Partial<GeneratorOptions>} param1
   * @returns {Promise<Array<import('./generated.d.ts').NodeJsAPIDocumentationSchema>>}
   */
  async generate(input, { output }) {
    const groupedModules = groupNodesByModule(input);

    const buildSection = createSectionBuilder();

    /**
     * @param {ApiDocMetadataEntry} head
     * @returns {import('./generated.d.ts').NodeJsAPIDocumentationSchema}
     */
    const processModuleNodes = head => {
      const nodes = groupedModules.get(head.api);
      if (!nodes) {
        throw new TypeError('TODO');
      }

      const section = buildSection(head, nodes);

      return section;
    };

    /**
     * @type {Array<import('./generated.d.ts').NodeJsAPIDocumentationSchema>}
     */
    const generatedValues = [];

    // Gets the first nodes of each module, which is considered the "head"
    const headNodes = input.filter(node => node.heading.depth === 1);

    headNodes.forEach(async node => {
      // Get the json for the node's section
      const section = processModuleNodes(node);

      generatedValues.push(section);

      // Write it to the output file
      if (output) {
        // await writeFile(
        //   join(output, `${node.api}.json`),
        //   JSON.stringify(section)
        // );
      }
    });

    if (output) {
      // Current directory path relative to the `index.mjs` file
      const baseDir = import.meta.dirname;

      // Read the contents of the JSON schema
      const schemaString = await readFile(
        join(baseDir, 'schema.jsonc'),
        'utf8'
      );

      // Parse the JSON schema into an object
      const schema = await parse(schemaString);

      // Write the parsed JSON schema to the output directory
      // await writeFile(
      //   join(output, 'node-doc-schema.json'),
      //   JSON.stringify(schema)
      // );
    }

    return generatedValues;
  },
};
