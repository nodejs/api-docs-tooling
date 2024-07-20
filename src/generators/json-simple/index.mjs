'use strict';

/**
 * This generator generates a simplified JSON version of the API docs and returns it as a string
 * this is not meant to be used for the final API docs, but for debugging and testing purposes
 *
 * This generator is a top-level generator, and it takes the raw AST tree of the API doc files
 * and returns a stringified JSON version of the API docs.
 *
 * @typedef {import('../../types.d.ts').ApiDocMetadataEntry[]} Input
 *
 * @type {import('../types.d.ts').GeneratorMetadata<Input, string>}
 */
export default {
  name: 'json-simple',

  version: '1.0.0',

  description:
    'Generates the simple JSON version of the API docs, and returns it as a string',

  dependsOn: 'ast',

  async generate(input) {
    return JSON.stringify(input, null, 2);
  },
};
