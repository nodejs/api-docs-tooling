// @ts-check
'use strict';

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as jsoncParse } from 'jsonc-parser';

// TODO add test w/ https://www.npmjs.com/package/jsonschema

/**
 * TODO docs
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {GeneratorMetadata<Input, Array<import('./generated.d.ts').NodeJsAPIDocumentationSchema>>}
 */
export default {
  name: 'json-all',

  // This should be kept in sync with the JSON schema version
  version: '2.0.0',

  description: 'TODO',

  dependsOn: 'json',

  /**
   * Generates a JSON file.
   *
   * @param {Input} input
   * @param {Partial<GeneratorOptions>} param1
   * @returns {Promise<any>}
   */
  async generate(input, { output }) {
    const generatedValue = {
      $schema: './node-doc-all-schema.jsonc',
      modules: [],
      text: [],
    };

    const propertiesToIgnore = ['$schema', 'source'];

    input.forEach(section => {
      const copiedSection = {};

      Object.keys(section).forEach(key => {
        if (!propertiesToIgnore.includes(key)) {
          copiedSection[key] = section[key];
        }
      });

      switch (section.type) {
        case 'module':
          generatedValue.modules.push(copiedSection);
          break;
        case 'text':
          generatedValue.text.push(copiedSection);
          break;
        default:
          throw new TypeError(`unsupported root section type ${section.type}`);
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
      const schema = await jsoncParse(schemaString);

      // Write the parsed JSON schema to the output directory
      // await writeFile(
      //   join(output, 'node-doc-schema.json'),
      //   JSON.stringify(schema)
      // );
    }

    return generatedValue;
  },
};
