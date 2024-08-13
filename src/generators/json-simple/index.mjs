'use strict';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { remove } from 'unist-util-remove';

import createQueries from '../../queries.mjs';
import { getRemark } from '../../utils/remark.mjs';

/**
 * This generator generates a simplified JSON version of the API docs and returns it as a string
 * this is not meant to be used for the final API docs, but for debugging and testing purposes
 *
 * This generator is a top-level generator, and it takes the raw AST tree of the API doc files
 * and returns a stringified JSON version of the API docs.
 *
 * @typedef {Array<ApiDocMetadataEntry>} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, string>}
 */
export default {
  name: 'json-simple',

  version: '1.0.0',

  description:
    'Generates the simple JSON version of the API docs, and returns it as a string',

  dependsOn: 'ast',

  async generate(input, options) {
    // Gets a remark processor for stringifying the AST tree into JSON
    const remarkProcessor = getRemark();

    // Iterates the input (ApiDocMetadataEntry) and performs a few changes
    const mappedInput = input.map(({ content, ...rest }) => {
      // Depp clones the content nodes to avoid affecting upstream nodes
      const clonedContent = JSON.parse(JSON.stringify(content));

      // Removes all the Stability Index nodes, since they shouldn't be included in the final JSON
      // and are already represented in the metadata (metadata.stability.toJSON)
      remove(clonedContent, [createQueries.UNIST.isStabilityNode]);

      // For the JSON generate we want to transform the whole content into JSON
      clonedContent.toJSON = () => remarkProcessor.stringify(clonedContent);

      return { ...rest, content: clonedContent };
    });

    // This simply grabs all the different files and stringifies them
    const stringifiedContent = JSON.stringify(mappedInput);

    // Writes all the API docs stringified content into one file
    // Note: The full JSON generator in the future will create one JSON file per top-level API doc file
    await writeFile(join(options.output, 'api-docs.json'), stringifiedContent);
  },
};
